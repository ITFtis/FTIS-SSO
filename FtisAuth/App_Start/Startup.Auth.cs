using System;
using System.Configuration;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Mvc;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Owin;
using System.Linq;
using Microsoft.IdentityModel.Tokens;

namespace FtisAuth
{
    public partial class Startup
    {
        private static string clientId = ConfigurationManager.AppSettings["ida:ClientId"];
        private static string aadInstance = EnsureTrailingSlash(ConfigurationManager.AppSettings["ida:AADInstance"]);
        private static string tenantId = ConfigurationManager.AppSettings["ida:TenantId"];
        private static string postLogoutRedirectUri = ConfigurationManager.AppSettings["ida:PostLogoutRedirectUri"];
        private static string authority = aadInstance + tenantId + "/v2.0";

        public void ConfigureAuth(IAppBuilder app)
        {
            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);

            app.UseCookieAuthentication(new CookieAuthenticationOptions());//
            //{
            //    CookieManager = new Microsoft.Owin.Host.SystemWeb.SystemWebCookieManager(),
            //    SlidingExpiration = true,
            //    ExpireTimeSpan = TimeSpan.FromSeconds(5) });
            
            var adoptionsc = new OpenIdConnectAuthenticationOptions
            {
                ClientId = clientId,
                Authority = authority,
                PostLogoutRedirectUri = postLogoutRedirectUri,
                //UseTokenLifetime = false,
                //TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters { 
                //    //LifetimeValidator =new Microsoft.IdentityModel.Tokens.LifetimeValidator(),
                //ValidateIssuer = false, NameClaimType = "name" },
                Notifications = new OpenIdConnectAuthenticationNotifications()
                {
                    AuthorizationCodeReceived = (context) =>
                    {
                        return System.Threading.Tasks.Task.FromResult(0);
                    },
                    RedirectToIdentityProvider = (context) =>
                    {
                        context.ProtocolMessage.PostTitle = "處理中...";
                        if (context.Request.Path.Value.ToUpper().IndexOf("SIGNOUT") >= 0)
                        {
                            context.ProtocolMessage.LoginHint =context.Request.User.Identity.Name;
                            //context.ProtocolMessage.DomainHint = "ftis.org.tw";
                        }
                        //else
                        return System.Threading.Tasks.Task.FromResult(0);
                    },
                    SecurityTokenReceived = (context) =>
                    {
                        return System.Threading.Tasks.Task.FromResult(0);
                    },
                    MessageReceived = (context) =>
                    {
                        return System.Threading.Tasks.Task.FromResult(0);
                    },
                    SecurityTokenValidated = (context) =>
                    {
                        //context.AuthenticationTicket.Properties.ExpiresUtc = DateTime.UtcNow.AddSeconds(10);
                        string name = context.AuthenticationTicket.Identity.FindFirst("preferred_username").Value;
                        context.AuthenticationTicket.Identity.AddClaim(new Claim(ClaimTypes.Name, name, string.Empty));
                        //context.Response.Redirect($"/Account/Err?msg=sdfsfdsf&errmsg=dddddddddddddddd");
                        return System.Threading.Tasks.Task.FromResult(0);
                        //}
                    },
                    AuthenticationFailed = (context) =>
                    {
                        var msg = "";
                        var errmsg = context.Exception.Message;
                        context.HandleResponse();
                        if (context.Exception.Message.Contains("IDX21323"))
                        {
                            //context.SkipToNextMiddleware();
                            //context.HandleResponse();
                            context.OwinContext.Authentication.Challenge();
                            msg = "登入期間因閒置時間過久，無法正常登入";

                        }
                        else
                            context.Response.Redirect(new UrlHelper(System.Web.HttpContext.Current.Request.RequestContext).Action("Err", "Account", new { msg = msg, errmsg = errmsg }));//
                            //context.Response.Redirect(Url.Content("~/XXXX"))
                        return Task.FromResult(0);
                    }
                }
            };
            #region 改變系統Request.IsAuthenticated的timeout時間
            //Azure AD Access token lifetime 預設random value ranging between 60-90 minutes (75 minutes on average)
            //https://learn.microsoft.com/en-us/azure/active-directory/develop/access-tokens#access-token-lifetime
            //https://learn.microsoft.com/zh-tw/azure/active-directory/develop/access-tokens#access-token-lifetime

            //UseTokenLifetime = false + SecurityTokenValidated>>加上給SecurityTokenValidated>> context.AuthenticationTicket.Properties.ExpiresUtc值
            //但Azure AD timeout時間還是無解(似乎要從Azure portal 條件式存取>登入頻率設定(最小1小時))(系統端timeout，還是會自動登入Azure AD(還沒timeout))
            //adoptionsc.UseTokenLifetime = fals;
            #endregion

            app.UseOpenIdConnectAuthentication(adoptionsc);
                 
        }

        private static string EnsureTrailingSlash(string value)
        {
            if (value == null)
            {
                value = string.Empty;
            }

            if (!value.EndsWith("/", StringComparison.Ordinal))
            {
                return value + "/";
            }

            return value;
        }
    }
}
