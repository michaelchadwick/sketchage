<?php
  if (isset($_POST['imageConversion'])) {
    return imageConversion($_POST['imageConversion']);
  }

  function imageConversion($data) {
    $file_dir = _randomString();
    $file_name = _randomString();

    $data = _stripHeader($data);

    $img = imagecreatefromstring(base64_decode($data));

    $dir = './data/' . date('y-m-j') . '_' . $file_dir;

    if (!is_dir($dir)) {
      mkdir($dir, 0744, true);
    }

    $path = $dir . '/' . $file_name;

    // imagebmp($img, $path . '.bmp');
    imagegif($img, $path . '.gif');
    imagejpeg($img, $path . '.jpg');
    imagepng($img, $path . '.png');

    imagedestroy($img);

    echo $path;
  }

  function _randomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )), 1, $length);
  }

  function _stripHeader($data) {
    $header = "data:image/bmp;base64,";
    $data = str_replace($header, "", $data);

    return $data;
  }
?>