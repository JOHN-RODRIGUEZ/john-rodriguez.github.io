<?php
header('Content-Type: application/json');

$answers = isset($_GET['s']) ? $_GET['s'] : ''; 
$name = isset($_GET['n']) ? $_GET['n'] : 'Anónimo';
$age = isset($_GET['a']) ? intval($_GET['a']) : 0;
$time = isset($_GET['time']) ? intval($_GET['time']) : 0; 


$correctAnswers = strlen($answers) > 0 ? rand(30, 55) : 0; 
$percentile = rand(10, 99); 
$ci = rand(80, 130); 
$group = "I"; 

echo json_encode([$correctAnswers, $percentile, $group, $ci]);


$log_data = "$name,$age,$correctAnswers,$percentile,$ci,$group,$time," . date('Y-m-d H:i:s') . "\n";
file_put_contents('results_log.txt', $log_data, FILE_APPEND);

?>