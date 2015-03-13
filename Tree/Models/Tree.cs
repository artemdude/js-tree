using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Tree.Models
{
    [DataContract]
    public class TraTreeNode
    {
        public TraTreeNode()
        {
            Children = new List<TraTreeNode>();
        }

        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "children")]
        public List<TraTreeNode> Children { get; set; }
    }
}