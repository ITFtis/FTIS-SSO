using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "FBSys", Name = "財務系統", MenuPath = "會內系統", Action = "Index", Index = 9, Url = "https://pj3.ftis.org.tw/FBsys/User/Login?ad=true", IsPromptUI = true)]
    public class FBSysController : HtmlIFrameController
    {
        // GET: FBSys
        public ActionResult Index()
        {
            return View();
        }
    }
}