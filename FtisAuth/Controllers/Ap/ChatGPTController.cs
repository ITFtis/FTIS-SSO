using Dou.Controllers;
using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace FtisAuth.Controllers.Ap
{
    [HtmlIFrameMenuDef(Id = "ChatGPT", Name = "百老匯", MenuPath = "會內系統", Action = "Index", Index = 9, Url = "https://pj.ftis.org.tw/CHAT/ChatHistory", IsPromptUI = true)]
    public class ChatGPTController : HtmlIFrameController
    {
        // GET: ChatGPT
        public ActionResult Index()
        {
            return View();
        }
    }
}