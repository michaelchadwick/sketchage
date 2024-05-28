<?php

/* Receive the RAW post data. */
$content = trim(file_get_contents("php://input"));

/* $decoded can be used the same as you would use $_POST in $.ajax */
$decoded = json_decode($content, true);

/* Send error to Fetch API, if JSON is broken */
if (!is_array($decoded)) {
  die(json_encode([
    'value' => 0,
    'error' => 'Received JSON is improperly formatted',
    'data' => null,
  ]));
}

if (isset($decoded['imageConversion'])) {
  $data = $decoded['imageConversion'];

  $file_dir = _randomString();
  $file_name = _randomString();
  $data = _stripHeader($data);

  $img = imagecreatefromstring(base64_decode($data));

  if ($img) {
    $dir = '../../data/' . date('y-m-j_h-i-s') . '_' . $file_dir;

    if (!is_dir($dir)) {
      if (!mkdir($dir, 0744, true)) {
        die(json_encode([
          'data' => null,
          'error' => 'Error: could not create image conversion data structure',
          'ok' => false
        ]));
      }
    }

    $path = $dir . '/' . $file_name;

    // imagebmp($img, $path . '.bmp');
    if (
      imagegif($img, $path . '.gif') &&
      imagejpeg($img, $path . '.jpg') &&
      imagepng($img, $path . '.png')
    ) {
      imagedestroy($img);

      die(json_encode([
        'data' => $path,
        'error' => null,
        'ok' => true
      ]));
    } else {
      die(json_encode([
        'data' => null,
        'error' => 'Error: could not save image conversion',
        'ok' => false
      ]));
    }
  } else {
    die(json_encode([
      'data' => null,
      'error' => 'Error: could not create image from base64 string',
      'ok' => false
    ]));
  }
}

function _randomString($length = 10)
{
  return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length / strlen($x)))), 1, $length);
}

function _stripHeader($data)
{
  $header = "data:image/bmp;base64,";
  $data = str_replace($header, "", $data);

  return $data;
}
