﻿using System.Web;
using System.Web.Optimization;

namespace FtisAuth
{
    public class BundleConfig
    {
        // 如需統合的詳細資訊，請瀏覽 https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // 使用開發版本的 Modernizr 進行開發並學習。然後，當您
            // 準備好可進行生產時，請使用 https://modernizr.com 的建置工具，只挑選您需要的測試。
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new Bundle("~/bundles/bootstrap").Include(
                    "~/Scripts/bootstrap.bundle.min.js"
                    ));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css"));

            bundles.Add(new ScriptBundle("~/dou/js").Include(
               "~/Scripts/gis/bootstraptable/bootstrap-table.js",
               "~/Scripts/gis/bootstraptable/extensions/mobile/bootstrap-table-mobile.js",
               "~/Scripts/gis/select/bselect/bootstrap-select-b5.min.js",
               "~/Scripts/Dou/datetimepicker/js/moment.js",
               "~/Scripts/Dou/datetimepicker/js/tempusdominus-bootstrap-4.min.js", //bootstrpa4、5
               "~/Scripts/gis/helper.js",
               "~/Scripts/gis/Main.js",
               "~/Scripts/Dou/Dou.js"
           ));

            bundles.Add(new StyleBundle("~/dou/css").Include(
                "~/Scripts/gis/bootstraptable/bootstrap-table.css",
                "~/Scripts/gis/select/bselect/bootstrap-select-b5.min.css",
                //"~/Scripts/gis/leafletExt.css",
                "~/Scripts/gis/Main.css",
                "~/Scripts/Dou/Dou.css",
                "~/Scripts/Dou/datetimepicker/css/bootstrap-datetimepicker.css"
                ));
        }
    }
}
