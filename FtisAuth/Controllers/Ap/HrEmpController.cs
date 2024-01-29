using Dou.Controllers;
using Dou.Misc.Attr;
using FtisAuth.Controllers.Comm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "HrEmp", Name = "人員基本資料管理", MenuPath = "會內系統", Action = "Index", Index = 1, Url = "https://pj.ftis.org.tw/FtisEmpManage", IsPromptUI =true)]
    public class HrEmpController : HtmlIFrameController
    {
        // GET: HrEmp
        public ActionResult Index()
        {
            return View();
        }
    }
}