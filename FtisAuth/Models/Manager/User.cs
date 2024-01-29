using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace FtisAuth.Models.Manager
{
    [Table("User")]
    public class User : Dou.Models.UserBase
    {
        [Display(Name = "密碼", Order = 0)]
        [StringLength(128)]
        [Required]
        [ColumnDef(Visible = false)]
        public override string Password { get; set; }
    }
}