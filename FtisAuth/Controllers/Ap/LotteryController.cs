using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Policy;
using System.Web;
using System.Web.Mvc;
using System.Xml.Linq;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "Lottery", Name  = "抽獎活動系統", MenuPath = "會內系統", Action = "Index", Index = 99, Url = "https://pj3.ftis.org.tw/DrawGame/", IsPromptUI = true)]
    public class LotteryController : HtmlIFrameController
    {
        // GET: Lottery
        public ActionResult Index()
        {
            return View();
        }
    }
}