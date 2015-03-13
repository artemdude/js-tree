using System.Web.Mvc;
using Tree.Models;

namespace Tree.Controllers
{
    public class HomeController : BaseController
    {

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetData()
        {
            var rootNode = new TraTreeNode();

            var counter = 0;

            for (int i = 0; i < 25; i++)
            {
                counter++;

                var n1 = new TraTreeNode()
                {
                    Id = counter,
                    Title = "rootNode " + counter
                };

                rootNode.Children.Add(n1);

                for (int j = 0; j < 5; j++)
                {
                    counter++;

                    var n2 = new TraTreeNode()
                    {
                        Id = counter,
                        Title = "rootNode n2 " + counter
                    };

                    n1.Children.Add(n2);

                    for (int c = 0; c < 5; c++)
                    {
                        counter++;

                        var n3 = new TraTreeNode()
                        {
                            Id = counter,
                            Title = "rootNode n2 " + counter
                        };

                        n2.Children.Add(n3);
                    }

                }
            }

            return Json(rootNode);
        }

    }
}
