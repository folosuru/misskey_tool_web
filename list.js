
let all_data;

async function getStatus(){
    let index = document.getElementById("sort_rule").selectedIndex;
    const str = String(document.getElementById("sort_rule").options[index].value);
    const order = document.getElementsByName("order");
    let order_str;
    for (let i = 0; i < order.length; i++) {
        if (order[i].checked) {
            order_str = order[i].value;
            break;
        }
    }
    let registration_flag = 0;
    if (document.getElementById("registration_select_open").checked){
        registration_flag = registration_flag + 1;
    }
    if (document.getElementById("registration_select_invite").checked){
        registration_flag = registration_flag + 2;
    }
    if (document.getElementById("registration_select_unknown").checked){
        registration_flag = registration_flag + 16;
    }
    const params = {
        sort_by: str,
        sort_order: order_str,
        register: String(registration_flag),
    };
    await fetch('https://api.z-n-a-k.net/lo/misskey_list.php?'+new URLSearchParams(params) , {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        }})
        .then((response) => response.json())
        .then((data) => writeData(data));
}

function onPageChange(index) {
    let now_select = document.getElementById("page_select_child_selected")
    if (now_select != null) {
        now_select.setAttribute("id", "");
    }
    writeDataByPage(index);
    let next_select = document.getElementsByName("page_selector_"+ String(index));
    next_select.forEach(function (node){
        node.setAttribute("id", "page_select_child_selected");
    });
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

function click_tab(){
    let container = document.getElementById("selector_content");
    let select_bar = document.getElementById("selector_header");
    if (container.getAttribute('class') === "show"){
        container.setAttribute('class',"hide");
        select_bar.textContent =  ">"+select_bar.textContent.slice(1);
    } else {
        container.setAttribute('class' , "show");
        select_bar.textContent =  "v"+select_bar.textContent.slice(1);
    }
}

function writeData(data){
    all_data = data;
    console.log("get")
    let old_list = document.getElementsByClassName("page_select");
    Array.prototype.forEach.call(old_list, function (old) {
        let clone = old.cloneNode(false);
        old.parentNode.replaceChild(clone, old);
    })
    let page_select = document.getElementsByClassName("page_select");
    for (let i = 0; i < data.length/30; i++) {
        let root = creatediv("page_select_child")
        root.appendChild(document.createTextNode(String( i +1 )))
        root.setAttribute("name", "page_selector_"+String(i))
        root.setAttribute("onclick", "onPageChange("+ i +")")
        Array.prototype.forEach.call(page_select, function(item) {
            item.appendChild(root.cloneNode(true));
        })
    }

    onPageChange(0);
    //data.forEach(element => addInstance(element));
}

/**
 * @param {number} page
 */
function writeDataByPage(page) {
    let old = document.getElementById("all_instance_container");
    let clone = old.cloneNode( false );
    old.parentNode.replaceChild(clone, old);
    let offset = page * 30;
    for (let i = 0; i < 30; i++) {
        if (all_data.length <= i + offset) {break;}
        addInstance(all_data[i + offset]);
    }
}

function addInstance(data){
    let root = creatediv("instance_top_container");
    let banner = creatediv("instance_banner_container");
    let anker = root.appendChild(document.createElement("a"));
    anker.href = "https://" + data["domain"];
    anker.target = "_blank";
    if (data["banner"] !== null && data["banner"] !== '' ) {
        let img = document.createAttribute('src')
        img.value = data["banner"];
        banner.appendChild(document.createElement("img")).setAttributeNode(img);
    }
    let content = creatediv("instance_content_container")
    let basic_info = creatediv("instance_basic_info_container");
    img = document.createElement("img");
    img.src = data["icon"];
    content.appendChild(basic_info).appendChild(creatediv("instance_icon")).appendChild(img);
    let name = basic_info.appendChild(creatediv("instance_name_container"))
    name.appendChild(creatediv("instance_name")).appendChild(document.createTextNode(data["name"]));
    name.appendChild(document.createTextNode(data["domain"]));
    content.appendChild(creatediv("instance_description")).appendChild(document.createTextNode(removeTags(data["description"])));
    let instance_information = content.appendChild(creatediv("instance_information_container"));
    instance_information.appendChild(creatediv("instance_software")).appendChild(document.createTextNode(data["software"]));
    instance_information.appendChild(creatediv("instance_user")).appendChild(document.createTextNode(data["user_count"]))
    instance_information.appendChild(creatediv("instance_post")).appendChild(document.createTextNode(data["post_count"]));
    anker.appendChild(banner)
    anker.appendChild(content)
    document.getElementById("all_instance_container").appendChild(root);
}

/**
 * @param {string} value
 * @return {Element}
 */
function creatediv(value){
    let div;
    div = document.createElement("div");
    attr = document.createAttribute("class");
    attr.value = value;
    div.setAttributeNode(attr);
    return div;
}

window.addEventListener('load', (event) => {
    getStatus()
});
function removeTags(str) {

    return str.replace('<br>',"\n").replace(/<.+?>/g, '');
}
