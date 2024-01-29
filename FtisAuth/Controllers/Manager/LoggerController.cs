using Dou.Controllers;
using Dou.Misc;
using Dou.Models.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Manager
{
    [Dou.Misc.Attr.MenuDef(Name = "記錄查詢", MenuPath = "系統管理", Action = "Index", Index = 4, Func = Dou.Misc.Attr.FuncEnum.ALL, AllowAnonymous = false)]
    public class LoggerController : Dou.Controllers.LoggerBaseController<Dou.Models.Logger>
    {
        // GET: Logger
        public ActionResult Index()
        {
            return View();
        }

        protected override Dou.Models.DB.IModelEntity<Dou.Models.Logger> GetModelEntity()
        {
            return new Dou.Models.DB.ModelEntity<Dou.Models.Logger>(new FtisAuth.Models.FtisAuthContext());
        }
        //protected override IEnumerable<Dou.Models.Logger> GetDataDBObject(IModelEntity<Dou.Models.Logger> dbEntity, params KeyValueParams[] paras)
        //{
        //    var opts= base.GetDataDBObject(dbEntity, paras);
        //    opts.
        //    return opts;
        //}
        //public override DataManagerOptions GetDataManagerOptions()
        //{
        //    var opts = base.GetDataManagerOptions();
        //    opts.addToListTop = true;
        //    return opts;    
        //}
    }

}