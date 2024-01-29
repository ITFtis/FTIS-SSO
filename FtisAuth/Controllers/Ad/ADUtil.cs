using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.DirectoryServices;

namespace FtisAuth.Controllers.Ad
{
    /// <summary>
    ///ADUtil 的摘要说明
    /// </summary>
    public class ADUtil
    {
        // LDAP地址 例如：LDAP://my.com.cn
        public static string LDAP_HOST = "LDAP://my.com.cn";
        // 具有LDAP管理權限的特殊帳號
        public static string USER_NAME = "adminuser";
        // 具有LDAP管理權限的特殊帳號的密碼
        public static string PASSWORD = "adminpassword";

        public ADUtil()
        {
            //
            //TODO
            //
        }

        /**
         * 向某個組加人員
         * groupName 組名稱
         * userName 人員帳號
         **/
        public static void addGroupMember(string groupName, string userName)
        {
            DirectoryEntry group = getGroupByName(groupName);
            group.Username = USER_NAME;
            group.Password = PASSWORD;
            group.Properties["member"].Add(getUserDNByName(userName));
            group.CommitChanges();
        }

        /**
         * 某組移出指定人員
         * groupName 組名稱
         * userName 人員帳號
         **/
        public static void removeGroupMember(string groupName, string userName)
        {
            DirectoryEntry group = getGroupByName(groupName);
            group.Username = USER_NAME;
            group.Password = PASSWORD;
            group.Properties["member"].Remove(getUserDNByName(userName));
            group.CommitChanges();
        }

        /**
         * 取指定人員網域信息
         * userName 人員帳號
         **/
        public static object getUserDNByName(string name)
        {
            DirectorySearcher userSearch = new DirectorySearcher(LDAP_HOST);
            userSearch.SearchRoot = new DirectoryEntry(LDAP_HOST, USER_NAME, PASSWORD);
            userSearch.Filter = "(SAMAccountName=" + name + ")";
            SearchResult user = userSearch.FindOne();
            foreach(var p in user.Properties.PropertyNames)
            {
                var pn = p.ToString();
                //if(pn== "objectsid")
                //{
                //    var sd = System.Text.Encoding.Unicode.GetString( user.Properties[p + ""][0] as byte[]);
                //}
                var v = user.Properties[p + ""][0].ToString();
                if ("|pwdlastset|lastlogon|lastlogontimestamp|badpasswordtime|".IndexOf(pn) >= 0 && !string.IsNullOrEmpty(v))
                    v += ">>" + new DateTime(Convert.ToInt64( v)).ToString("yyyy/MM/dd HH:mm:ss");
                Console.WriteLine($"{pn}>>{v}");
            }
            if (user == null)
            {
                throw new Exception("請確認網域用戶資料是否正確");
            }
            return user;//.Properties["distinguishedname"][0];
        }
        public static SearchResult getSearchResultUserByName(string name)
        {
            DirectorySearcher userSearch = new DirectorySearcher(LDAP_HOST);
            userSearch.SearchRoot = new DirectoryEntry(LDAP_HOST, USER_NAME, PASSWORD);
            userSearch.Filter = "(SAMAccountName=" + name + ")";
            SearchResult user = userSearch.FindOne();
            //foreach (var p in user.Properties.PropertyNames)
            //{
            //    var pn = p.ToString();
            //    var v = user.Properties[p + ""][0].ToString();
            //    if ("|pwdlastset|lastlogon|lastlogontimestamp|badpasswordtime|".IndexOf(pn) >= 0 && !string.IsNullOrEmpty(v))
            //        v += ">>" + new DateTime(Convert.ToInt64(v)).ToString("yyyy/MM/dd HH:mm:ss");
            //    if ("whenchanged" == pn)
            //    {
            //        var cdt = Convert.ToDateTime(v);
            //        if((DateTime.Now-cdt).TotalHours<24)

            //    }
            //    Console.WriteLine($"{pn}>>{v}");
            //}
            if (user == null)
            {
                throw new Exception("請確認網域用戶資料是否正確");
            }
            //return user.GetDirectoryEntry();
            return user;

        }
        
        public static void SetPassword(DirectoryEntry de, string npwd)
        {
            //DirectorySearcher userSearch = new DirectorySearcher(LDAP_HOST);
            //userSearch.SearchRoot = new DirectoryEntry(adpath);
            //userSearch.Filter = "(SAMAccountName=" + name + ")";
            //SearchResult user = userSearch.FindOne();
            //DirectoryEntry usr = new DirectoryEntry(adpath);
            //usr.Path = path;
            //de = new DirectoryEntry(LDAP_HOST, USER_NAME, PASSWORD);
            de.AuthenticationType = AuthenticationTypes.Secure;

            object[] password = new object[] { npwd };
            object ret = de.Invoke("SetPassword", password);
            de.CommitChanges();
            de.Close();
        }
        /**
         * 取指定組網域信息
         * name 組名稱
         **/
        public static DirectoryEntry getGroupByName(string name)
        {
            DirectorySearcher search = new DirectorySearcher(LDAP_HOST);
            search.SearchRoot = new DirectoryEntry(LDAP_HOST, USER_NAME, PASSWORD);
            search.Filter = "(&(cn=" + name + ")(objectClass=group))";
            search.PropertiesToLoad.Add("objectClass");
            SearchResult result = search.FindOne();
            DirectoryEntry group;
            if (result != null)
            {
                group = result.GetDirectoryEntry();
            }
            else
            {
                throw new Exception("請確認AD組列表是否正確");
            }
            return group;
        }
    }
}