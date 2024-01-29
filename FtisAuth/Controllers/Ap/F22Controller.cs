using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "F22", Name = "F22人事差勤平台", MenuPath = "會內系統", Action = "Index", Index = 0, Url = "https://pj3.ftis.org.tw/HRM_F22", IsPromptUI = true)]
    public class F22Controller : HtmlIFrameController
    {
        // GET: F22
        public ActionResult Index()
        {
            return View();
        }
    }
}