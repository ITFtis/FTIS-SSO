using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.OldSys
{
    [HtmlIFrameMenuDef(Id = "FtisHome", Name = "首頁", MenuPath = "", Action = "Index", Index = 99, Url = "https://www.ftis.org.tw/",AllowAnonymous =true)]
    public class FtisHomeController : HtmlIFrameController
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }
    }
}