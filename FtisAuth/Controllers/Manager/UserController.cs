using FtisAuth.Models.Manager;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Manager
{
    [Dou.Misc.Attr.MenuDef(Name = "使用者管理", MenuPath = "系統管理", Action = "Index", Func = Dou.Misc.Attr.FuncEnum.ALL, AllowAnonymous = false)]
    public class UserController : Dou.Controllers.UserBaseControll<User, Role>
    {
        // GET: User
        public ActionResult Index()
        {
            return View();
        }

        internal static System.Data.Entity.DbContext _dbContext = RoleController._dbContext;
        protected override Dou.Models.DB.IModelEntity<User> GetModelEntity()
        {
            return new Dou.Models.DB.ModelEntity<User>(_dbContext);
        }

        public override ActionResult DouLogin(User user, string returnUrl, bool redirectLogin = false)
        {
            //return base.DouLogin(user, returnUrl, redirectLogin);
            //var dns = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
            //if (dns != null && dns.HostName == "F01721")
            //{
            //    var lv = base.DouLogin(user, returnUrl, redirectLogin);
            //    return lv is RedirectResult || lv is RedirectToRouteResult ? lv : PartialView("DouLogin", user);
            //}
            if (Request.IsAuthenticated)
            {
                ActionResult r = null;
                var f22user = FtisHelperV2.DB.Helper.GetAllEmployee().Where(m => m.EMail == User.Identity.Name).FirstOrDefault();
                //f22user = new FtisHelperV2.DB.Model.F22cmmEmpData { Fno = "raychen0126" };
                if (f22user == null) {
                    ViewBag.ErrorMessage = $"系統資料使用者({User.Identity.Name})不存在，請洽管理員!!"; ;
                }
                else {
                    user = FindUser(f22user.Fno);
                    if (user == null)
                    {
                        user = new User() { Id = f22user.Fno, Name = f22user.Name, Password = Dou.Context.Config.PasswordEncode(Dou.Context.Config.DefaultPassword), Enabled = false };
                        this.AddDBObject(GetModelEntity(), new User[] { user });
                    }
                    r= base.DouLogin(user, returnUrl, false);
                }
                //return PartialView(user);
                if (ViewBag.ErrorMessage != null)
                {
                    ViewBag.LoginUrl = Dou.Context.Config.LoginPage;
                    ViewBag.LogoffUrl = new UrlHelper(System.Web.HttpContext.Current.Request.RequestContext).Action("DouLogoff", "User");
                    return PartialView("DouLoginError", user);//, new { u=user, msg= ViewBag.ErrorMessage });
                }
                else
                {
                    return r != null && r is RedirectResult || r is RedirectToRouteResult ? r : PartialView(user);
                }
            }
            else
            {
                string callbackUrl = Url.Action("DouLogin", "User", routeValues: new { returnUrl = returnUrl }, protocol: Request.Url.Scheme);
                string adSigninUrl = Url.Action("SignIn", "Account", routeValues: new { returnUrl = callbackUrl }, protocol: Request.Url.Scheme);
                return Redirect(adSigninUrl);
            }
            
        }
        public override ActionResult DouLogoff()
        {
            base.DouLogoff();
            string callbackUrl = Url.Action("SignOut", "Account", 
                routeValues: new { returnUrl = Url.Action("DouLogin", "User", null, protocol: Request.Url.Scheme) }, protocol: Request.Url.Scheme);
            return Redirect(callbackUrl);
        }
    }

}