using Dou.Help;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.DirectoryServices;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ad
{
    public class PwdController : Controller
    {
        // GET: Pwd
        public ActionResult Index()
        {
            return View();
        }
        public PwdController()
        {
            ADUtil.LDAP_HOST = $"LDAP://{System.Configuration.ConfigurationManager.AppSettings["AdDomain"]}";
            ADUtil.USER_NAME = $"{System.Configuration.ConfigurationManager.AppSettings["AdAdminAccount"]}";
            ADUtil.PASSWORD = $"{System.Configuration.ConfigurationManager.AppSettings["AdAdminPwd"]}";
        }
        /// <summary>
        /// 密碼原則
        /// 1.同時涵蓋以下四種的組合，含英文大寫、英文小寫、數字、符號
        /// 2.長度至少12碼
        /// 3.不可包含帳號(@前)
        /// 4.每三個月強制更換，且不可與前三次相同(這裡無法實作)
        /// 5.每次變更密碼至少間格24小時
        /// 6.如忘記密碼，請通知資訊室申請重新配發新密碼(不用實作)
        /// </summary>
        /// <param name="u"></param>
        /// <returns></returns>
        public ActionResult Change( ADUser u )
        {

            string ErrorMessage = null;
            if (IsPostBack())
            {
                if (string.IsNullOrEmpty(u.Account) || string.IsNullOrEmpty(u.OldPassword) || string.IsNullOrEmpty(u.NewPassword) ||
                    string.IsNullOrEmpty(u.ConfirmPassword))
                    ErrorMessage = "請輸入完整資料!!";
                if (ErrorMessage == null)
                {
                    u.Account = u.Account.Trim();
                    u.OldPassword = u.OldPassword.Trim();
                    u.NewPassword = u.NewPassword.Trim();
                    u.ConfirmPassword = u.ConfirmPassword.Trim();
                }
                if (ErrorMessage == null)
                {
                    if (u.OldPassword == u.NewPassword)
                        ErrorMessage = "新、舊密碼不能一樣";
                }
                if (ErrorMessage == null)
                {
                    if (u.NewPassword != u.ConfirmPassword)
                        ErrorMessage = "新密碼、確認密碼不一致，請確認";
                }
                if (ErrorMessage == null)
                {
                    if (u.NewPassword.IndexOf(u.Account) >= 0)
                        ErrorMessage = "新密碼不能包含帳號資料!!";
                }
                if (ErrorMessage == null)
                {
                    var mc = 0;
                    mc += new System.Text.RegularExpressions.Regex(@"^(?=.*\d).{12,99}$").IsMatch(u.NewPassword) ? 1 : 0; ;
                    mc += new System.Text.RegularExpressions.Regex(@"^(?=.*[a-z]).{12,99}$").IsMatch(u.NewPassword) ? 1 : 0; ;
                    mc += new System.Text.RegularExpressions.Regex(@"^(?=.*[A-Z]).{12,99}$").IsMatch(u.NewPassword) ? 1 : 0; ;
                    mc += new System.Text.RegularExpressions.Regex(@"^(?=.*\W).{12,99}$").IsMatch(u.NewPassword) ? 1 : 0; ;
                    //var m = regex.IsMatch(p);
                    if (mc < 4)
                        ErrorMessage = "密碼安全性不符規定";
                }
                if (ErrorMessage == null) //連線AD並確認
                {
                    ErrorMessage = CheckADAccountAndChangePwd(u);
                }
                if (ErrorMessage == null)
                    return RedirectToAction("ChangeOK", new ADUser { Name = u.Name });
            }
            else
            {
                var f22u = DouUnobtrusiveSession.Session[AccountController.USER_SESSION_KEY] as FtisHelperV2.DB.Model.F22cmmEmpData;
                if (f22u != null) {
                    u.Account = f22u.EMail.Substring(0, f22u.EMail.IndexOf("@"));
                }
            }
            ViewBag.ErrorMessage = ErrorMessage;
            return PartialView(u);
        }

        public ActionResult ChangeOK(ADUser u)
        {
            return PartialView(u);
        }
        string CheckADAccountAndChangePwd(ADUser u)
        {
            string result = null;
            try
            {
                //如Ad server有標註新帳號，第一次都入需更改密碼，在還沒用其他管道(如本基更window更改密碼)前，用此認證再帳密正確下，也會被回應"使用者名稱或密碼不正確。"
                DirectoryEntry entry = new DirectoryEntry(string.Format("LDAP://{0}", "ftis.local"), u.Account, u.OldPassword);
                entry.RefreshCache();
                //or
                //var ads = entry.ObjectSecurity;
                System.Diagnostics.Debug.WriteLine("AD帳密驗證成功!!");
            }
            catch (Exception ex)
            {
                result = "AD"+ex.Message;
            }
            if (result == null)
            {
                try
                {
                    var adu = ADUtil.getSearchResultUserByName(u.Account);
                    foreach (var p in adu.Properties.PropertyNames)
                    {
                        var pn = p.ToString();
                        var v = adu.Properties[p + ""][0]?.ToString();
                        var pv = v;
                        if (v != null)
                        {

                            if ("|pwdlastset|lastlogon|lastlogontimestamp|badpasswordtime|".IndexOf(pn) >= 0 && !string.IsNullOrEmpty(v))
                                pv += ">>" + new DateTime(Convert.ToInt64(v)).AddYears(1600).AddHours(8).ToString("yyyy/MM/dd HH:mm:ss");
                            //pwdlastset>>133275523253717011>>0423/05/03 01:52:05  //5/22
                            //whenchanged>>2023/5/3 上午 01:52:05  //5/22>>2023/5/15 上午 08:31:19

                            //if ("whenchanged" == pn)  
                            //{
                            //    var cdt = Convert.ToDateTime(v).AddHours(8); //資料為UTC時間
                            if ("pwdlastset" == pn) {
                                var cdt = new DateTime(Convert.ToInt64(v)).AddYears(1600).AddHours(8); //資料為UTC時間
                                //忽略管理者給初始化密碼邏輯(Aa++員編數字+員編數字 或 Aa++員編數字+員編數字 exAa0172101721、Bb0172101721)
                                var ignore = u.OldPassword.Length == 12 && u.OldPassword.Substring(2).All(char.IsDigit) && (u.OldPassword.StartsWith("Aa") || u.OldPassword.StartsWith("Bb"));
                                //if (!ignore && (DateTime.Now - cdt).TotalHours < 24)//如管理者手動變更密碼後，要求使用上馬上邊更密碼，會有24小時內問題， 固定邏輯編碼的密碼可跳過這
                                //    throw new Exception($"與上次變更密碼至少間格24小時<br>(上次變更時間{cdt})");
                            }
                            else if ("displayname" == pn)
                                pv = v.Replace("產基會_", "");
                            //u.Name = v.Replace("產基會_","");
                        }
                    
                        System.Diagnostics.Debug.WriteLine($"{pn}>>{pv}");
                    }
                    ADUtil.SetPassword(adu.GetDirectoryEntry(), u.NewPassword); 
                }catch (Exception ex)
                {
                    result = ex.Message;
                }
            }
            return result;
        }

        protected bool IsPostBack()
        {
            bool isPost = string.Compare(Request.HttpMethod, "POST",
               StringComparison.CurrentCultureIgnoreCase) == 0;
            if (Request.UrlReferrer == null) return false;

            bool isSameUrl = string.Compare(Request.Url.AbsolutePath,
               Request.UrlReferrer.AbsolutePath,
               StringComparison.CurrentCultureIgnoreCase) == 0;

            return isPost && isSameUrl;
        }
        public class ADUser
        {
            [Display(Name = "帳號(@前)")]
            public string Account { get; set; }
            public string Name { get; set; }
            [Display(Name = "原密碼")]
            public string OldPassword { get; set; }
            [Display(Name = "新密碼")]
            public string NewPassword { get; set; }
            [Display(Name = "確認密碼")]
            public string ConfirmPassword { get; set; }
        }
    }
}