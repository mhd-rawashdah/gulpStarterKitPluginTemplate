const sortableListUI= {
	sortableList:null
	,contrainer:null
	,tag:""
	,data:null
	,get items(){
		return sortableListUI.sortableList.items;
	}
	/*
		This method will call the datastore to pull a single object
		it needs to have an array property called `items` each item need {title, imgUrl}
	 */
	,init(elementId,tag="content") {
		this.tag=tag;
		this.contrainer = document.getElementById(elementId);
		this.contrainer.innerHTML="loading...";
		buildfire.datastore.get(this.tag, (e, obj) => {
			if (e) {
				console.error(e);
				this.contrainer.innerHTML="An error has occurred. Please contact your system admin.";
			}
			else if (obj && obj.data) {
				this.data = obj.data;
				if(!obj.data.items)
					buildfire.datastore.save({items:[]},t.tag,()=>{
						t.data.items=[];
						t.contrainer.innerHTML="No items have been added yet.";
					});
				else if (obj.data.items.length == 0)
					this.contrainer.innerHTML="No items have been added yet.";
				else {
					this.contrainer.innerHTML="";
					sortableListUI.render(obj.data.items);
				}
			}
		});
	}

	, render(items) {
		let t = this;
		this.sortableList = new buildfire.components.SortableList(this.contrainer, items || []);

		this.sortableList.onItemClick = this.onItemClick;
		this.sortableList.onDeleteItem = (item, index, callback) => {
			buildfire.notifications.confirm({
					message: "Are you sure you want to delete " + item.title + "?"
					, confirmButton: {text: 'Delete', key: 'y', type: 'danger'}
					, cancelButton: {text: 'Cancel', key: 'n', type: 'default'}
				}, function (e, data) {
					if (e) console.error(e);
					if (data.selectedButton.key == "y") {
						sortableListUI.sortableList.items.splice(index,1);
						buildfire.datastore.save({$set:{items:sortableListUI.sortableList.items}},t.tag,e=>{
							if(e)
								console.error(e);
							else
								callback(item);
						});

					}
				}
			);
		};

		this.sortableList.onOrderChange=(item, oldIndex, newIndex)=>{
			buildfire.datastore.save({$set:{items:sortableListUI.sortableList.items}},this.tag,()=>{});
		}
	}

	,updateItem(item,index,divRow){
		sortableListUI.sortableList.injectItemElements(item,index,divRow);
		let cmd = {$set:{}};
		cmd.$set['items.' + index] = item;
		buildfire.datastore.save(cmd,this.tag,e=>{
			if(e)console.error(e);
		});

	}

	,addItem(item){
		let cmd = {
			$push:{items:item}
		};
		buildfire.datastore.save(cmd, this.tag,e=>{
			if(e)console.error(e);
		});

		sortableListUI.sortableList.append(item);
	}
	,onItemClick(item,divRow) {
		buildfire.notifications.alert({message: item.title + " clicked"});
	}
};