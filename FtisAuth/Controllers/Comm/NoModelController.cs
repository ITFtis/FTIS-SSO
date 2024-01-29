using Dou.Misc.Attr;
using Dou.Models.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Comm
{
    [AutoLogger]
    public class NoModelController : Dou.Controllers.AGenericModelController<Object>
    {
        protected override IModelEntity<object> GetModelEntity()
        {
            return new Dou.Models.DB.ModelEntity<object>(Manager.RoleController._dbContext);
        }
    }
}