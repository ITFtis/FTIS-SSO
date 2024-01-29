using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "AssetSys", Name = "資產管理系統V2", MenuPath = "會內系統", Action = "Index", Index = 6, Url = "https://pj3.ftis.org.tw/AssetSys", IsPromptUI = true)]
    public class AssetSysController : HtmlIFrameController
    {
        // GET: EQSys
        public ActionResult Index()
        {
            return View();
        }
    }
}