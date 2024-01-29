using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "EmpSeat3", Name = "座位表查詢(新視窗)", MenuPath = "會內系統", Action = "Index", Index = 2, Url = "https://pj4.ftis.org.tw/SEAT/SEAT/SEAT", AllowAnonymous = false, IsPromptUI =true)]
    public class EmpSeat3Controller : HtmlIFrameController
    {
        // GET: EmpSite3
        public ActionResult Index()
        {
            return View();
        }
    }
}