/*------------Public Methods--------------*/

/*init()*/
/*getCheckedNodes(nodeObj)*/
/*collapseAll()*/
/*expandAll()*/
/*add(id, title)*/
/*remove(id)*/
/*getNode(id)*/
/*expandNode(id)*/
/*expandNodes(idCollection)*/
/*collapseNode(id)*/
/*collapseNodes(idCollection)*/
/*search(str)*/
/*refresh(id)*/


/*------------Public Properties--------------*/

/*checkedNodes (type: array)*/
/*expandedNodes (type: array)*/

/*enableSearch (type: boolean)*/
/*enableCheckBox (type: boolean)*/
/*showExpandAllButton (type: boolean)*/
/*showCollapseAllButton (type: boolean)*/

/*width (type: string)*/
/*height (type: string)*/

/*!!! this properties have to be initialized before calling method init()*/


/*------------Node Properties----------------*/

/*title (type: string)*/
/*expanded (type: boolean)*/
/*parent (type: object node)*/
/*children (type: array nodes)*/
/*checked (type: checkBoxState)*/


/*------------Node Methods----------------*/

/*expand()*/
/*collapse()*/
/*build()*/
/*add(id, title)*/
/*refresh()*/
/*remove()*/
/*check(checkBoxState)*/


/*-----------Events------------------------*/

/*onCheckBoxClick (type: function)*/
/*onNodeExpanded (type: function)*/
/*onTreeLoaded (type: function)*/


/*------------Example of nodeDomObj----------*/

/*<table id="tree_table_7">
<tr id="tree_rowInfo_7">
<td id="tree_cellExpand_7" onclick=""></td>
<td id="tree_cellTitle_7" onclick=""></td>
</tr>
<tr id="tree_rowData_7">
<td id="tree_cellCollectLine"></td>
<td id="tree_cellChildren_7"></td>
</tr>
</table>
*/

String.format = function () {
    var s = arguments[0];

    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}


function TraTreeObj(clientInstanceName, dataObj) {

    var $this = this;

    var treeId = clientInstanceName;

    //traTree dom elements
    var treeControlContainer;
    var noFoundLabel;
    var treeContainer;
    var searchBox;
    var expandAllButton;
    var collapseAllButton;
    var searchLoadingIndicator;

    this.CheckBoxState = { CHECKED: 1, UNCHECKED: 0, SEMICHECKED: -1 };

    //events
    this.onCheckBoxClick;
    this.onNodeExpanded;

    this.onTreeLoaded;

    this.getCheckedNodes = function (nodeObj) {

        var checkedNodes = [];

        var check = function (nodeObj) {

            $.each(nodeObj.children, function (index, node) {

                if (!checkIsNodeHasChildren(node)) {

                    if (node.checked === $this.CheckBoxState.CHECKED) {
                        checkedNodes.push(node);
                    }
                }
                else {
                    check(node);
                }
            });
        };


        if (typeof (nodeObj) == 'undefined') {
            check(dataObj);
        }
        else {
            check(nodeObj);
        }

        return checkedNodes;
    };


    //array of ids (only nodes which don't have children)
    this.checkedNodes = [];

    //array of ids (any nodes)
    this.expandedNodes = [];

    this.enableSearch = false;
    this.enableCheckBox = false;
    this.showExpandAllButton = false;
    this.showCollapseAllButton = false;

    this.width = '';
    this.height = '';

    this.emptyTreeText = '';

    var isTreeLoaded = false;

    this.getTreeLoadStatus = function () {
        return isTreeLoaded;
    }

    var initTreeDomElements = function () {




        treeControlContainer = $(String.format('#{0}', treeId)).css('width', $this.width);

        var searchContainer = $(String.format('<div id="{0}_searchContainer" class="tr_search-container"></div>', treeId)).appendTo(treeControlContainer);

        if ($this.enableSearch) {
            searchBox = $(String.format('<input id="{0}_search" onkeyup="{0}.search_d()" type="text" />', clientInstanceName)).appendTo(searchContainer);

            searchContainer.append(String.format('<input id="{0}_search_p" type="button" class="btn" onclick="{0}.search_p_d()" value="<<" /><input id="{0}_search_n" class="btn" type="button" onclick="{0}.search_n_d()" value=">>" />', clientInstanceName));
            searchContainer.append(String.format('<div id="{0}_nofound" class="tr_nofound-label" style="display: none; height:{1};"></div>', clientInstanceName, $this.height));




            noFoundLabel = $(String.format('#{0}_nofound', clientInstanceName)).appendTo(treeControlContainer);
        }

        var treeContainerWrapper = $('<div></div>').appendTo(treeControlContainer);

        searchLoadingIndicator = $(String.format('<div style="width:{0}; height:{1}; display:none; margin: -5px; position:absolute; background:red; opacity:0.5">fg</div>', '300px', $this.height)).appendTo(treeContainerWrapper);


        treeContainer = $(String.format('<div id="{0}_container" class="tr_container" style="overflow:auto; height:{1};"></div>', clientInstanceName, $this.height)).appendTo(treeContainerWrapper);

       

        var buttonsContainer = $(String.format('<div id="{0}_buttonsContainer" class="tr_buttons-container"></div>', treeId)).appendTo(treeControlContainer);

        if ($this.showExpandAllButton) {
            expandAllButton = $(String.format('<input id="{0}_expand" class="btn" type="button" onclick="{0}.expandAll()" value="Expand all" />', clientInstanceName)).appendTo(buttonsContainer);
        }

        if ($this.showCollapseAllButton) {
            collapseAllButton = $(String.format('<input id="{0}_collapse" class="btn" type="button" onclick="{0}.collapseAll()" value="Collapse all" />', clientInstanceName)).appendTo(buttonsContainer);
        }
    };

    var checkIsNodeHasChildren = function (nodeObj) {

        if (nodeObj.children.length == 0) {
            return false;
        }
        return true;
    };

    var getCheckBoxCssClass = function (checkBoxState) {

        switch (checkBoxState) {
            case $this.CheckBoxState.CHECKED:
                return 'tr_check-box-c';
            case $this.CheckBoxState.UNCHECKED:
                return 'tr_check-box-n';
            case $this.CheckBoxState.SEMICHECKED:
                return 'tr_check-box-s';
        }
    };

    var initDataObject = function () {

        var checkIsNodLast = function (nodeObj) {

            var result = false;
            var childrenCount = nodeObj.parent.children.length;

            $.each(nodeObj.parent.children, function (index, node) {

                if (node === nodeObj) {

                    if (childrenCount === (index + 1)) {
                        result = true;
                        return false;
                    }
                }
            });

            return result;
        };

        var createDomObject = function (nodeObj) {

            var isNodeLast = checkIsNodLast(nodeObj);
            var isNodeHasChildren = checkIsNodeHasChildren(nodeObj);

            var expandClass = isNodeHasChildren ? (nodeObj.expanded ? 'tr_minus' : 'tr_plus') : 'tr_expand-cell';
            var tableId = domObjIds.table(nodeObj.id);
            var rowInfoId = domObjIds.rowInfo(nodeObj.id);
            var rowDataId = domObjIds.rowData(nodeObj.id);
            var cellExpandId = domObjIds.cellExpand(nodeObj.id);
            var cellTitleId = domObjIds.cellTitle(nodeObj.id);
            var cellCollectLineId = domObjIds.cellCollectLine(nodeObj.id);
            var cellChildrenId = domObjIds.cellChildren(nodeObj.id);
            var nodeChainClass = isNodeLast ? 'tr_cell_ln' : 'tr_cell_n';
            var nodesChainClass = isNodeLast ? '' : 'tr_cell_pn';
            var checkBoxClass = $this.enableCheckBox ? getCheckBoxCssClass(nodeObj.checked) : '';
            var expandFunction = String.format('{0}.expandNode_d(this)"', treeId);
            var checkBoxFunction = String.format('{0}.checkNode_d(this)"', treeId);

            var domObj = $(String.format('<table id="{0}" cellspacing="0" cellpadding="0" class="tr_tb"><tr id="{1}" class="tr_row-info"><td id="{2}" class="tr_cell {3}" onclick="{4}"><div class="{5}"></div></td><td id="{6}" class="tr_row-title {7}" onclick="{8}">{9}</td></tr><tr id="{10}"><td id="{11}" class="{12}"></td><td id="{13}"></td></tr></table>',
                                                tableId,
                                                rowInfoId,
                                                cellExpandId,
                                                nodeChainClass,
                                                expandFunction,
                                                expandClass,
                                                cellTitleId,
                                                checkBoxClass,
                                                $this.enableCheckBox ? checkBoxFunction : expandFunction,
                                                nodeObj.title,
                                                rowDataId,
                                                cellCollectLineId,
                                                nodesChainClass,
                                                cellChildrenId));


            domObj[0].nodeObj = nodeObj;

            return domObj;
        };

        /* #node functions (mixin functions)*/

        //refresh dom object
        var refreshNode = function () {

            if (this.domObj !== undefined) {

                var domObj = createDomObject(this);

                var o = $(this.domObj.table);

                this.domObj = new DomObj(domObj[0], this.id);

                $(o).replaceWith(domObj);

                if (this.expanded) {
                    this.expand();
                }
            }

        };

        //insert dom object to children container
        var buildNode = function () {

            var domObj = createDomObject(this);

            this.domObj = new DomObj(domObj[0], this.id);

            $(this.parent.domObj.cellChildren).append(domObj);
        };

        //expand node (if parent node collapsed it expanded too and marked as expanded)
        var expandNode = function () {

            var isNodeCanBeExpanded = function (nodeObj) {
                return checkIsNodeHasChildren(nodeObj);
            };

            if (isNodeCanBeExpanded(this)) {

                /*if we need to expand node programaly we need to ensure that parents
                nodes are expanded, if it's not - expand them*/
                if (this.parent.expanded === false) {
                    this.parent.expand();
                }

                /*if node is expanded firs time we need to create children nodes html (dom objects)*/
                if (this.domObj === undefined) {
                    this.build();
                }

                if (checkIsNodeHasChildren(this)) {

                    if ($(this.domObj.cellChildren).find('table').length === 0) {

                        var cellChildren = this.domObj.cellChildren;

                        $.each(this.children, function (index, node) {
                            node.build();

                            //expand children nodes if they are marked as expanded
                            if (node.expanded === true) {
                                node.expand();
                            }
                        });
                    }

                    $(this.domObj.cellExpand).find('div').attr('class', 'tr_minus');
                    $(this.domObj.rowData).show();
                    this.expanded = true;

                    if (typeof ($this.onNodeExpanded) == 'function') {
                        $this.onNodeExpanded(this);
                    }
                }

            }

        };

        //collapse node
        var collapseNode = function () {

            if (this.domObj !== undefined) {

                if (checkIsNodeHasChildren(this)) {
                    $(this.domObj.cellExpand).find('div').attr('class', 'tr_plus');
                    $(this.domObj.rowData).hide();
                    this.expanded = false;

                    if (typeof ($this.onNodeExpanded) == 'function') {
                        $this.onNodeExpanded(this);
                    }
                }
            }
        };

        //remove node from object and dom, be careful it cannot be canceled
        var removeNode = function () {

            var nodeObj = this;

            $.each(nodeObj.parent.children, function (index, node) {

                if (node === nodeObj) {
                    nodeObj.parent.children.splice(index, 1);
                    nodeObj.parent.refresh();
                    return false;
                }
            });
        };


        //add new node and buil it if it has to be visible now
        var addChildrenNode = function (id, title) {

            if (typeof (id) == 'number' || typeof (title) == 'string') {

                var newNode = new Object();
                newNode.id = id;
                this.children.push(newNode);

                init(newNode, this, title, false, $this.CheckBoxState.UNCHECKED, []);

                this.refresh();

                return newNode;
            }
        };

        var checkNode = function (checkBoxState) {

            //mark node as checked
            var check = function (nodeObj, checkBoxState) {

                if (nodeObj.domObj != undefined) {
                    $(nodeObj.domObj.cellTitle).attr('class', getCheckBoxCssClass(checkBoxState));
                }

                nodeObj.checked = checkBoxState;

                if (typeof ($this.onCheckBoxClick) == 'function') {
                    $this.onCheckBoxClick(nodeObj);
                }
            };

            //mark ALL parent node as checked
            var checkParent = function (nodeObj) {

                if (nodeObj.parent != undefined) {
                    var childrenCheckedCount = 0;
                    var childrenSemiCheckedCount = 0;
                    var childrenCount = nodeObj.children.length;

                    $.each(nodeObj.children, function (index, node) {

                        if (node.checked == $this.CheckBoxState.SEMICHECKED) {
                            childrenSemiCheckedCount++;
                        }

                        if (node.checked == $this.CheckBoxState.CHECKED) {
                            childrenCheckedCount++;
                        }

                    });

                    if (childrenSemiCheckedCount > 0) {
                        check(nodeObj, $this.CheckBoxState.SEMICHECKED);
                    }
                    else {

                        if (childrenCheckedCount == 0) {
                            check(nodeObj, $this.CheckBoxState.UNCHECKED);
                        }
                        else if (childrenCheckedCount == childrenCount) {
                            check(nodeObj, $this.CheckBoxState.CHECKED);
                        }
                        else {
                            check(nodeObj, $this.CheckBoxState.SEMICHECKED);
                        }
                    }

                    checkParent(nodeObj.parent);
                }
            };

            //mark children node as checked, if any exist
            var checkChildren = function (nodeObj, checkBoxState) {

                if (checkIsNodeHasChildren(nodeObj)) {

                    $.each(nodeObj.children, function (index, node) {
                        check(node, checkBoxState);
                        checkChildren(node, checkBoxState);
                    });
                }
            };

            check(this, checkBoxState);
            checkParent(this.parent);

            if (this.children.length != 0) {
                checkChildren(this, checkBoxState);
            }
        };

        /* #end node functions */

        var init = function (node, parent, title, expanded, checked, children) {
            node.title = title;
            node.expanded = expanded;
            node.parent = parent;
            node.children = children;
            node.checked = checked;

            node.expand = expandNode;
            node.collapse = collapseNode;
            node.build = buildNode;
            node.add = addChildrenNode;
            node.refresh = refreshNode;
            node.remove = removeNode;
            node.check = checkNode;
        };

        var initRootNode = function () {

            var doNothing = function () { };

            init(dataObj, undefined, 'root node', true, undefined, dataObj.children);

            dataObj.refresh = buildRootNodes;
            dataObj.remove = doNothing;
            dataObj.collapse = doNothing;
            dataObj.expand = doNothing;
            dataObj.domObj = { cellChildren: treeContainer };
            dataObj.checkNode = doNothing;
        };

        initRootNode();

        //init all node come from dataObj
        var initAll = function (dataObj, parent) {

            $.each(dataObj, function (index, node) {

                var checked = $.inArray(node.id, $this.checkedNodes) == -1 ? $this.CheckBoxState.UNCHECKED : $this.CheckBoxState.CHECKED;
                var expanded = $.inArray(node.id, $this.expandedNodes) == -1 ? false : true;

                init(node, parent, node.title, expanded, checked, node.children);

                if (checked == $this.CheckBoxState.CHECKED) {
                    node.check(checked);
                }

                initAll(node.children, node);
            });

        };

        initAll(dataObj.children, dataObj);
    };

    /*#Dom object functions */
    function DomObj(table, id) {
        this.table = table;
        this.rowInfo = $(table).find('#' + domObjIds.rowInfo(id))[0];
        this.rowData = $(table).find('#' + domObjIds.rowData(id))[0];
        this.cellExpand = $(table).find('#' + domObjIds.cellExpand(id))[0];
        this.cellTitle = $(table).find('#' + domObjIds.cellTitle(id))[0];
        this.cellCollectLine = $(table).find('#' + domObjIds.cellCollectLine(id))[0];
        this.cellChildren = $(table).find('#' + domObjIds.cellChildren(id))[0];
    };

    var domObjIds = {
        table: function (nodeId) {
            return String.format('{0}_table_{1}', treeId, nodeId);
        },
        rowInfo: function (nodeId) {
            return String.format('{0}_rowInfo_{1}', treeId, nodeId);
        },
        rowData: function (nodeId) {
            return String.format('{0}_rowData_{1}', treeId, nodeId);
        },
        cellExpand: function (nodeId) {
            return String.format('{0}_cellExpand_{1}', treeId, nodeId);
        },
        cellTitle: function (nodeId) {
            return String.format('{0}_cellTitle_{1}', treeId, nodeId);
        },
        cellCollectLine: function (nodeId) {
            return String.format('{0}_cellCollectLine_{1}', treeId, nodeId);
        },
        cellChildren: function (nodeId) {
            return String.format('{0}_cellChildren_{1}', treeId, nodeId);
        } 
    };
    /*#End Dom object functions */

    //build first level nodes
    var buildRootNodes = function () {
        treeContainer.html('');

        if (checkIsNodeHasChildren(dataObj)) {
            $.each(dataObj.children, function (index, node) {

                node.build();

                if (node.expanded) {
                    node.expand();
                }
            });
        }
        else {
            treeContainer.html($this.emptyTreeText);
        }
    };

    this.init = function () {
        initTreeDomElements();
        initDataObject();
        buildRootNodes();

        isTreeLoaded = true;

        if (typeof (this.onTreeLoaded) == 'function') {
            this.onTreeLoaded();
        }
    };

    //ce - boolean
    //expand - true, collapse - false
    var collapseExpandAll = function (ce) {

        var collapseExpand = function (nodeObj) {

            if (checkIsNodeHasChildren(nodeObj)) {

                ce ? nodeObj.expand() : nodeObj.collapse();

                $.each(nodeObj.children, function (index, node) {
                    ce ? nodeObj.expand() : nodeObj.collapse();
                    collapseExpand(node);
                });
            }
        };

        $.each(dataObj.children, function (index, node) {

            if (checkIsNodeHasChildren(node)) {
                collapseExpand(node);
            }
        });
    };

    //collapse ALL nodes in the tree
    this.collapseAll = function () {
        collapseExpandAll(false);
    };

    //expand ALL nodes in the tree
    this.expandAll = function () {
        collapseExpandAll(true);
    };

    //add first level node
    this.add = function (id, title) {
        dataObj.add(id, title);
    };

    //remove node by Id
    this.remove = function (id) {

        var nodeObj = this.getNode(id);

        if (nodeObj !== null || nodeObj !== undefined) {
            nodeObj.remove();
        }
    };


    /*return nodeObj
    return null if node does not exist
    return undefined if id is wrong type or empty*/
    this.getNode = function (id) {

        if (typeof (id) == 'number') {

            var resultNode = null;

            var find = function (nodeObj) {


                if (checkIsNodeHasChildren(nodeObj)) {

                    $.each(nodeObj.children, function (index, node) {

                        if (node.id == id) {
                            resultNode = node;
                            return false;
                        }
                        else {
                            find(node);
                        }

                    });
                }
            };

            find(dataObj);

            return resultNode;
        }

    };


    //expand node by id
    this.expandNode = function (id) {

        if (typeof (id) == 'number') {
          
            var foundNode = this.getNode(id);

            if (foundNode !== null) {
                foundNode.expand();
            }
        }
    };

    //expand nodes by id collection
    this.expandNodes = function (idCollection) {

        for (var i = 0; i <= idCollection.length; i++) {

            if (typeof (idCollection[i]) == 'number') {
                this.expandNode(idCollection[i]);
            }
        }
    };

    //collapse node by id
    this.collapseNode = function (id) {

        if (typeof (id) == 'number') {

            var foundNode = this.getNode(id);

            if (foundNode !== null) {
                foundNode.collapse();
            }
        }
    };

    //expand nodes by id collection
    this.collapseNodes = function (idCollection) {

        for (var i = 0; i <= idCollection.length; i++) {

            if (typeof (idCollection[i]) == 'number') {
                this.collapseNode(idCollection[i]);
            }
        }
    };

    //after each searching the array of found nodes saves to this variable
    var lastFoundNodes;

    this.search = function (str) {

        var getNodesByText = function (str) {

            var resultNodes = [];
            var regEx = new RegExp(str, 'i');

            var find = function (nodeObj) {

                if (checkIsNodeHasChildren(nodeObj)) {

                    var l = nodeObj.children.length;

                    for (var i = 0; i < l; i++) {

                        var n = nodeObj.children[i];

                        if (n.title.match(regEx)) {
                            resultNodes.push(n);
                        }

                        if (checkIsNodeHasChildren(n)) {
                            find(n);
                        }
                    }
                }
            };

            find(dataObj);

            return resultNodes;
        };

        var clearFoundNodes = function () {
            $.each(lastFoundNodes, function (index, node) {
                $(node.domObj.cellTitle).html(node.title);
            });
        };


        if (str) {

            var regEx = new RegExp('(' + str + ')', 'i');
            var foundNodes = getNodesByText(str);

            if (foundNodes.length !== 0) {

                treeContainer.show();
                noFoundLabel.hide();

                if (lastFoundNodes !== undefined) {
                    clearFoundNodes();
                }

                this.collapseAll();

                $.each(foundNodes, function (index, node) {

                    node.parent.expand();

                    $(node.domObj.cellTitle).html(node.title.replace(regEx, '<span class="tr_node-highlighted">$1</span>'));
                });

                lastFoundNodes = foundNodes;
                currentFocusedFoundNode = 0;

                slideDoFoundNode(currentFocusedFoundNode);
            }
            else {
                treeContainer.hide();
                noFoundLabel.html(String.format('Nothing have been found.', str));
                noFoundLabel.show();
                currentFocusedFoundNode = undefined;
            }

        }
        else {
            //if str is empty 
            treeContainer.show();
            noFoundLabel.hide();

            if (lastFoundNodes !== undefined) {
                clearFoundNodes();
                currentFocusedFoundNode = undefined;
            }

            this.collapseAll();
        }

    };

    /*forexample we changed programatly some property of node
    and want to apply it to view presentation of tree
    traTree.getNode(1).title = 'хуйлобанская нода';
    traTree.refresh();
    or for specific node traTree.getNode(1).refresh(); to prevent rerendering whole tree*/
    this.refresh = function (id) {

        if (typeof (id) != 'undefined') {
            if (typeof (id) == 'number') {
                this.getNode(id).refresh();
            }
        }
        else {
            dataObj.refresh();
        }
    };

    /*#Dom elements functions */
    this.expandNode_d = function (element) {

        var node = $(element).parents('table')[0].nodeObj;

        if (node.expanded) {
            node.collapse();
        }
        else {
            node.expand();
        }
    };

    var timeSearch;

    this.search_d = function () {

        if (timeSearch) {
            clearTimeout(timeSearch);
        }

        timeSearch = setTimeout(function () {

            searchLoadingIndicator.css({ 'display': 'block' });

            if (searchLoadingIndicator.css('display') == 'block') {
                $this.search(searchBox.val());
                searchLoadingIndicator.hide();
            }


            //             searchLoadingIndicator.show('fast',function () {
            //                $this.search(searchBox.val());
            //                searchLoadingIndicator.hide();
            //            });

        }, 1500);

    };

    var currentFocusedFoundNode;

    this.search_p_d = function () {

        if (currentFocusedFoundNode !== undefined) {

            if (currentFocusedFoundNode != 0) {

                currentFocusedFoundNode = currentFocusedFoundNode - 1;
            }

            slideDoFoundNode(currentFocusedFoundNode);
        }
    };

    this.search_n_d = function () {

        if (currentFocusedFoundNode !== undefined) {

            if (currentFocusedFoundNode != lastFoundNodes.length - 1) {

                currentFocusedFoundNode = currentFocusedFoundNode + 1;
            }

            slideDoFoundNode(currentFocusedFoundNode);
        }
    };

    this.checkNode_d = function (element) {
        var node = $(element).parents('table')[0].nodeObj;

        if (node.checked == this.CheckBoxState.CHECKED) {
            node.check(this.CheckBoxState.UNCHECKED);
        }
        else if (node.checked == this.CheckBoxState.SEMICHECKED) {
            node.check(this.CheckBoxState.CHECKED);
        }
        else if (node.checked == this.CheckBoxState.UNCHECKED) {
            node.check(this.CheckBoxState.CHECKED);
        }


    };

    var slideDoFoundNode = function (index) {
        jQuery(String.format('#{0}', treeContainer.attr('id'))).scrollTo(String.format('#{0}', domObjIds.table(lastFoundNodes[index].id)), 400);
    };
    /*#end Dom elements functions */
};