using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.BuAp
{
    [HtmlIFrameMenuDef(Id = "ISQ", Name = "工服資料簡易查詢", MenuPath = "業務系統", Action = "Index", Index = 1, Url = "https://pj4.ftis.org.tw/WorkForm", IsPromptUI = false, AllowAnonymous =true)]
    public class ISQController : HtmlIFrameController
    {
        // GET: ISQ
        public ActionResult Index()
        {
            return View();
        }
    }
}