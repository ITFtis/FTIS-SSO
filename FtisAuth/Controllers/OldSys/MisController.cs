using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.OldSys
{
    [HtmlIFrameMenuDef(Id = "OldMis", Name = "線上管理系統", MenuPath = "會內系統", Action = "Index", Index = 99, Url = "https://mis.ftis.org.tw/", IsPromptUI = false)]

    public class MisController : HtmlIFrameController
    {
        
        // GET: Mis
        public ActionResult Index()
        {
            return View();
        }
    }
}