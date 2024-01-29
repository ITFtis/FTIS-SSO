using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Web.Mvc;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Owin;
using System.Linq;

namespace FtisAuth
{
    public partial class Startup
    {
        internal static string USER_COOKIE_NAME = null;
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

            var dns = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
            bool isDebug = dns != null && dns.HostName == "F01721";
            var sd = System.Web.HttpContext.Current.Request.Url.Scheme;
            Dou.Context.Init(new Dou.DouConfig
            {
                DefaultPassword = "3922",
                SessionTimeOut = 20,
                SqlDebugLog = isDebug,
                LoggerLogin = false,
                LoggerLogoff = false,
                AllowAnonymous = false,
                LoginPage = new UrlHelper(System.Web.HttpContext.Current.Request.RequestContext).Action("DouLogin", "User"),
                //LoginPage = new UrlHelper(System.Web.HttpContext.Current.Request.RequestContext).Action("DouLogin", "User"),
                LoggerListen = (log) =>
                {
                    if (log.WorkItem == Dou.Misc.DouErrorHandler.ERROR_HANDLE_WORK_ITEM)
                    {
                        Debug.WriteLine("DouErrorHandler發出的錯誤!!\n" + log.LogContent);
                        Logger.Log.For(null).Error("DouErrorHandler發出的錯誤!!\n" + log.LogContent);
                    }
                }
            }, true);

            // DbContext 的類別所產生單一物件，不能夠使用於多執行緒環境下
            // 所以在非有登入下(superdou)一次載入多元件可能會有同時create DbContext問題
            // 以下在第一次啟動時先create DbContext，避免多執行緒同時create DbContext
            //using (var cxt = FtisHelper.DB.FtisModelContext.Create(true))
            //{
            //    cxt.Department.Count();
            //}
            using (var cxt =new FtisAuth.Models.FtisAuthContext())
            {
                cxt.Role.Count();
            }
            USER_COOKIE_NAME = Dou.Context.Config.AppName;
            //login Remember Me 用 
            //app.UseCookieAuthentication(new CookieAuthenticationOptions
            //{
            //    AuthenticationType = USER_COOKIE_NAME,
            //    LoginPath = new PathString("/Account/SignIn"),
            //    Provider = new CookieAuthenticationProvider(),
            //    ExpireTimeSpan = TimeSpan.FromMinutes(Dou.Context.Config.SessionTimeOut)
            //});
        }

    }
}
