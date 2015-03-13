using System;
using System.Runtime.Serialization.Json;
using System.Web;
using System.Web.Mvc;

namespace Tree.Helpers
{
    public class JsonDataContractResult : JsonResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }

            HttpResponseBase response = context.HttpContext.Response;

            if (!String.IsNullOrEmpty(ContentType))
            {
                response.ContentType = ContentType;
            }
            else
            {
                response.ContentType = "application/json";
            }

            if (ContentEncoding != null)
            {
                response.ContentEncoding = ContentEncoding;
            }

            if (Data != null)
            {
                var serializer = new DataContractJsonSerializer(Data.GetType());
                serializer.WriteObject(response.OutputStream, Data);
            }
        }

    }
}