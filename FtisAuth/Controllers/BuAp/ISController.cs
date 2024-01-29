using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.BuAp
{
    [HtmlIFrameMenuDef(Id = "IS", Name = "工服案", MenuPath = "業務系統", Action = "Index", Index = 1, Url = "https://pj.ftis.org.tw/is", IsPromptUI = true)]
    public class ISController : HtmlIFrameController
    {
        // GET: IS
        public ActionResult Index()
        {
            return View();
        }
    }
}