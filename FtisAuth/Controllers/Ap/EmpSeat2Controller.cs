using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "EmpSeat2", Name = "座位表管理", MenuPath = "會內系統", Action = "Index", Index = 2, Url = "https://pj4.ftis.org.tw/SEAT/Customization/Customization", AllowAnonymous = false)]
    public class EmpSeat2Controller : HtmlIFrameController
    {
        // GET: EmpSite1
        public ActionResult Index()
        {
            return View();
        }
    }
}