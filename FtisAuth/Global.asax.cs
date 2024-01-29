using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace FtisAuth
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            Logger.Log.LoadConfig(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath(("~/Config")), "Log4netConfig.xml"));
            Logger.Log.AutoDeleteExpiredData(System.Web.Hosting.HostingEnvironment.MapPath(("~/log")), 20);
            Logger.Log.For(null).Info("IS Application_Start");

            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
