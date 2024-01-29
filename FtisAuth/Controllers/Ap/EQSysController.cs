using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "EQSys", Name = "資產管理系統V1", MenuPath = "會內系統", Action = "Index", Index = 7, Url = "https://pj3.ftis.org.tw/eqsys_ad", IsPromptUI = true)]
    public class EQSysController : HtmlIFrameController
    {
        // GET: EQSys
        public ActionResult Index()
        {
            return View();
        }
    }
}