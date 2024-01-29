using Dou.Models.DB;
using FtisHelperV2.DB.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [Dou.Misc.Attr.MenuDef(Id ="sdsd", Name = "部門", MenuPath = "系統管理", Action = "Index", Index = 4, Func = Dou.Misc.Attr.FuncEnum.Delete, AllowAnonymous = false)]
    public class DeController : Dou.Controllers.AGenericModelController<FtisHelperV2.DB.Model.F22cmmDep>
    {
        // GET: De
        public ActionResult Index()
        {
            return View();
        }

        protected override IModelEntity<F22cmmDep> GetModelEntity()
        {
            return new Dou.Models.DB.ModelEntity<FtisHelperV2.DB.Model.F22cmmDep>(FtisHelperV2.DB.FtisModelContext.Create(true));
        }
    }
}