using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Microsoft.Owin.Security;
using FtisHelperV2.DB.Model;
using Dou.Help;
using System.Security.Claims;
using System.Runtime.Caching;
using FtisAuth.Models.Manager;
using Dou.Models.DB;

namespace FtisAuth.Controllers
{
    public class AccountController : Dou.Controllers.AGenericModelController<object>
    {
        public ActionResult Index()
        {
            if (!Request.IsAuthenticated)
                return RedirectToAction("SignIn");
            var u = GetFtisUser();
            if (u != null)
            {
                var utemp = new F22cmmEmpData();
                DouHelper.Obj.CopyPropertiesTo(u, utemp);
                ViewBag.emp = Newtonsoft.Json.JsonConvert.SerializeObject(utemp);
                ViewBag.empstr = string.Join("", utemp.GetType().GetProperties().Where(p => p.CanWrite && p.GetValue(utemp, null) != null).Select(p => $"<tr><td>{p.Name}</td><td>{p.GetValue(u, null)}</td></tr>"));
                var d = FtisHelperV2.DB.Helper.GetDepartment(u.DCode);
                ViewBag.dep = Newtonsoft.Json.JsonConvert.SerializeObject(d);
                ViewBag.depstr = string.Join("", d.GetType().GetProperties().Where(p => p.CanWrite && p.GetValue(d, null) != null).Select(p => $"<tr><td>{p.Name}</td><td>{p.GetValue(d, null)}</td></tr>"));
            }
            else
                ViewBag.usernotfind = true;
            return View(u);
        }

        const string RETURN_URL_SESSION_KEY = "returnUrl_key";
        public ActionResult SignIn(string returnUrl)
        {
            #region 將returnUrl加入session，預防在AD登入閒置畫面太久沒輸入導致"IDX21323"問題(returnUrl會變null)
            //同一session僅能解決1個此現象
            string returnUrlSessionValue = DouUnobtrusiveSession.Session[RETURN_URL_SESSION_KEY]  as string;
            if (!string.IsNullOrEmpty(returnUrl) && string.IsNullOrEmpty(returnUrlSessionValue))
                DouUnobtrusiveSession.Session.Add(RETURN_URL_SESSION_KEY, returnUrl);
            #endregion

            // 傳送 OpenID Connect 登入要求。
            if (!Request.IsAuthenticated)
            {
                var rurl = HttpUtility.UrlDecode( HttpContext.Request.Url.ToString());
                HttpContext.GetOwinContext().Authentication.Challenge(new AuthenticationProperties { RedirectUri = rurl },
                    OpenIdConnectAuthenticationDefaults.AuthenticationType);
            }
            else
            {
                var u = GetFtisUser(); //用網頁重導一定會有值(因含cookue同一session)
                AddUserToMemoryCache(u); //client端系統如用HttpWebRequest呼叫(無帶相關cookie)用，既使超過設定SessionTimeOut，UserInfo也取的到值

                #region  寫入logger
                var uid = u != null ? u.Fno : User.Identity.Name.Substring(0, User.Identity.Name.IndexOf("@"))+"(無此員編)";
                Dou.Models.DB.LoggerEntity.WriteLog($"來源:{HttpUtility.HtmlDecode(returnUrl)}", "登入", uid);
                #endregion

                #region 解決預防在AD登入畫面閒置太久沒輸入導致"IDX21323"問題
                if (returnUrl == null && !string.IsNullOrEmpty(returnUrlSessionValue))
                {
                    returnUrl = returnUrlSessionValue;
                }
                if (!string.IsNullOrEmpty(returnUrl) && returnUrl == returnUrlSessionValue)
                    DouUnobtrusiveSession.Session.Remove(RETURN_URL_SESSION_KEY);
                #endregion

                if (string.IsNullOrEmpty(returnUrl))
                    return RedirectToAction("Index");
                else if (!returnUrl.ToLower().StartsWith("http"))
                    return Redirect(returnUrl);
                else
                {
                    string appendtoken = returnUrl.IndexOf("?") >= 0 ? "&" : "?";
                    appendtoken += "ssotoken=" + Dou.Help.DouUnobtrusiveSession.SessionId;
                    returnUrl += appendtoken;
                    return Redirect(returnUrl);
                }
            }
            return View();
        }



        internal F22cmmEmpData GetFtisUser()
        {
            if (Request.IsAuthenticated)
            {
                //FtisHelperV2.DB.FtisModelContext.LocalTest = false;
                /*
                 * 僅比對帳號id(@前(含))
                 * 因AD帳號有可能跟EMail不一致(@meet.ftis.org.tw，稽核或派駐很多@gmail、yahoo...)
                 * */
                var id = User.Identity.Name.Substring(0, User.Identity.Name.IndexOf("@")+1).ToLower().Trim();
                return FtisHelperV2.DB.Helper.GetAllEmployee().Where(m => m.Fno != "F99999" && !m.Quit && m.EMail != null && m.EMail.ToLower().Trim().StartsWith(id)).FirstOrDefault();
               //var d = FtisHelperV2.DB.Helpe.Seat.GetEmployeeIncludeSeat().Where(m => m.EMail == User.Identity.Name).FirstOrDefault();
               // var sdd = FtisHelperV2.DB.Helpe.Seat.GetEmployeeIncludeSeat().ElementAt(2);
               // var sd = sdd.Seat;
               // d.Seat.X = 9;
               // FtisHelperV2.DB.Helpe.Seat.AddOrUpdateEmployeeSeat(d.Seat);
               // return d;
            }
            else
                return null;
        }

        public ActionResult SignOut(string returnUrl, bool returnUrlIsCustomePage = false)
        {
            string callbackUrl = Url.Action("SignOutCallback", "Account", routeValues: new{ rebackUrl= returnUrl , rebackUrlIsCustomePage =returnUrlIsCustomePage}, protocol: Request.Url.Scheme);
            
            if (Request.IsAuthenticated)
            {
                #region 寫入logger
                var uid = GetFtisUser() != null?GetFtisUser().Fno: User.Identity.Name.Substring(0,User.Identity.Name.IndexOf("@"));
                Dou.Models.DB.LoggerEntity.Write($"來源:{HttpUtility.HtmlDecode(returnUrl)}", "登出", uid);
                #endregion

                HttpContext.GetOwinContext().Authentication.SignOut(
                new AuthenticationProperties { RedirectUri = callbackUrl },
                OpenIdConnectAuthenticationDefaults.AuthenticationType, CookieAuthenticationDefaults.AuthenticationType);
                
                return View();
            }
            else //非從Azure AD驗證登入
                return Redirect(callbackUrl);
        }

        public ActionResult SignOutCallback(string rebackUrl, bool rebackUrlIsCustomePage = true)
        {
            if (Request.IsAuthenticated)
            {
                // 如果使用者已驗證，則重新導向至首頁。
                return RedirectToAction("Index", "Account");
            }
            

            if (DouUnobtrusiveSession.Session[USER_SESSION_KEY] != null)
                ViewBag.Name = (DouUnobtrusiveSession.Session[USER_SESSION_KEY] as F22cmmEmpData).Name;
            RemoveUserToMemoryCache();
            if (rebackUrlIsCustomePage)
                return Redirect(rebackUrl);
            else
            {
                if (!string.IsNullOrEmpty(rebackUrl))
                    ViewBag.RebackUrl = rebackUrl;
                return View();
            }
        }
        public ActionResult Err(string msg, string errmsg)
        {
            ViewBag.Msg = msg;
            ViewBag.Errmsg = errmsg;
            return View();
        }
        /// <summary>
        /// 取使用者資料
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        public ActionResult UserInfo(string token)
        {
            string errorDesc = null;
            if (token == null || "".Equals(token.Trim()))
                errorDesc = "token不能為空";
            
            Dou.Help.DouUnobtrusiveSession.SessionObject cacheobj = null;

            //csv == null代表來源認證系統直接以HttpWebRequest呼叫無帶cookie
            //csv有值>>可驗證token是否合法
            var csv = this.Request.Cookies.Get(Dou.Context.Config.AppName)?.Value;

            //如是client直接呼叫會有值，如是透過系統(HttpWebRequest呼叫)，則需呼叫端需加入client的cookie
            //Request.IsAuthenticated ==true，才會有值
            F22cmmEmpData u = GetFtisUser(); 
            if(u != null && token != csv && errorDesc == null)
            {
                u = null;
                errorDesc = "非合法toke!!";
            }
            if (Request.IsAuthenticated)
            {
                if (u == null)
                    errorDesc = $"系統資料使用者({User.Identity.Name})不存在，請洽管理員!!";
            }
            #region session中取資料
            if (u == null && errorDesc == null) 
            {
                var tguid = new Guid();
                if (errorDesc == null && !Guid.TryParse(token, out tguid))
                    errorDesc = "token非法格式";
                if (errorDesc == null)
                {
                    

                    cacheobj = (Dou.Help.DouUnobtrusiveSession.SessionObject)MemoryCache.Default[token];
                    if (cacheobj == null)
                        errorDesc = "token不存在!!";
                    if (errorDesc == null)
                        u = (F22cmmEmpData)cacheobj[USER_SESSION_KEY];
                    if (u == null)
                        errorDesc = "token已過期!!";
                }
            }
            #endregion


            return Json(new { Success = errorDesc == null, Desc = errorDesc, User = new { 
                Fno=u.Fno,
                Mno=u.Mno,
                Name = u.Name,
                EMail = u.EMail,
                DCode = u.DCode,
                DCode_ = u.DCode_,
                GCode = u.GCode,
                TCode= u.TCode
            } }, JsonRequestBehavior.AllowGet);
        }

        internal const string USER_SESSION_KEY = "AD_USER";
        void AddUserToMemoryCache(F22cmmEmpData u)
        {
            DouUnobtrusiveSession.Session.Add(USER_SESSION_KEY, u);
            //var identity = new ClaimsIdentity(new[] {new Claim("Id", u.Fno)
            //                        }, Startup.USER_COOKIE_NAME);
            //var identity = new ClaimsIdentity(System.Security.Claims.ClaimsPrincipal.Current.Claims, Startup.USER_COOKIE_NAME);

            //HttpContext.GetOwinContext().Authentication.SignIn(new AuthenticationProperties
            //{
            //    //ExpiresUtc = DateTime.UtcNow.AddMinutes(Dou.Context.Config.SessionTimeOut), //記憶1天
            //    IsPersistent = false,//u.RememberMe,// user.RememberMe,//rememberMe,
            //    AllowRefresh = true,
            //}, identity);
            //var asd = User.Identity;
        }
        void RemoveUserToMemoryCache()
        {
            //DouUnobtrusiveSession.Session.Remove(USER_SESSION_KEY);
            DouUnobtrusiveSession.RemoveSession();
            //HttpContext.GetOwinContext().Authentication.SignOut(Startup.USER_COOKIE_NAME); //清除login remember me
        }

        protected override IModelEntity<object> GetModelEntity()
        {
            throw new NotImplementedException();
        }
    }
}
