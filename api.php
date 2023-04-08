<?php
const sort_order = [
	"asc" => "asc",
	"desc" => "desc"
];

const sort_by = [
	"name" => "name",
	"user" => "user_count",
	"post" => "post_count",
	"domain" => "domain"
];

header("Content-Type: application/json");
header("charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

echo getAll();
function getAll() : string{
	$db = getPDO();
	$request = $db->prepare("select * from instance_list where software = 'misskey' ". genInviteQuery() ." order by ".getSortBy() . " ". getSortOrder());
	$request->execute();
	$result = $request->fetchAll(PDO::FETCH_NAMED);
	//var_dump($result);
    $j = json_encode($result,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_INVALID_UTF8_IGNORE   );
    return $j;
}

function getPDO(): PDO {
	return new PDO(
		'pgsql:dbname=misskey_tool host=127.0.0.1 port=5432',
		'misskey_tool',
		'test',
		array(
			PDO::ATTR_PERSISTENT => true
		)
	);
}

function genInviteQuery(): string {
	if (array_key_exists("register",$_GET)){
		$flag =	intval($_GET["register"]);
	} else {
		return "";
	}

	$result = "and (";
	if ($flag & 0b1) { //everyone
		$result .= "register = '0' or ";
	}
	if ($flag & 0b10) { //invite only
		$result .= "register = '1' or ";
	}
	if ($flag & 0b100) { //need approval
		$result .= "register = '2' or ";
	}
	if ($flag & 0b1000) { // deny
		$result .= "register = '3' or ";
	}
	if ($flag & 0b10000) { //unknown
		$result .= "register = '4' or ";
	}
	if ($result !== "and ("){
		$result = substr($result,0,-4);
		return $result.") ";
	} else {
		return "";
	}

}

function getSortBy(): string {
	if (!array_key_exists("sort_by",$_GET)){
		return "post_count";
	}
	if (array_key_exists($_GET["sort_by"], sort_by)) {
		return sort_by[$_GET["sort_by"]];
	} else {
		return "post_count";
	}
}

function getSortOrder(){
	if (!array_key_exists("sort_order",$_GET)){
		return "";
	} else {
		if (array_key_exists($_GET["sort_order"], sort_order)){
			return sort_order[$_GET["sort_order"]];
		}
	}
	return "";
}
?>
