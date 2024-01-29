using Dou.Misc.Attr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FtisAuth.Controllers.Comm
{
    public class AppendTokenHtmlIFrameMenuDefAttribute: HtmlIFrameMenuDefAttribute
    {
        public bool UseToken { set; get; }
        string _Url = null;
        public override string Url
        {
            set
            {
                //_Url = value;
                var sidex = value.IndexOf("ssotoken");
                if (UseToken && sidex < 0)
                {
                    _Url = $"{value}{(value.IndexOf("?") >= 0 ? "&" : "?")}ssotoken={Dou.Help.DouUnobtrusiveSession.SessionId}";
                }
                else
                    _Url = value;
            }
            get
            {
                return _Url;
            }
        }
    }
}