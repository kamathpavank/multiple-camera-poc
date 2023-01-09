/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CameraIcon from "@mui/icons-material/Camera";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { ImageViewer } from "./ImageViewer/ImageViewer";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const App = ({ closeCapturedImages, entity_id }) => {
  // const { moveState } = MoveState()
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [listOfVideoInputs, setListOfVideoInputs] = useState([]);

  const [images, setImages] = useState([]);
  // const [cameraNumber, setCameraNumber] = useState(0);
  const [windowSize, setWindowSize] = useState(false);

  const [uploadImageLoading] = useState(false);

  // const [isFetchUploadedImages, setIsFetchUploadedImages] = useState(false)

  const [disableAction, setDisableAction] = useState(false);
  const [cameraId, setCameraId] = useState("");

  const [error, setError] = useState({
    status: false,
    severity: "error",
    message: "",
  });

  const theme = useTheme();
  const matches = useMediaQuery(
    `${theme.breakpoints.up("sm")} and (orientation: landscape)`
  );
  const largeDevices = useMediaQuery(theme.breakpoints.up("md"));

  const closeCameraInstance = () => {
    if (videoRef?.current?.srcObject) {
      videoRef.current.srcObject.getVideoTracks().forEach((track) => {
        // alert("has track")
        track.stop();
      });
      videoRef.current.srcObject = null;
      // handleError("success","camera"+(cameraNumber + 1)+listOfVideoInputs.length)
    }
  };

  const handleError = (severity, message) => {
    setError({
      status: true,
      severity,
      message,
    });
  };

  useEffect(() => {
    window.addEventListener(
      "resize",
      (e) => {
        closeCameraInstance();

        setWindowSize({
          width: e.target.innerWidth,
          height: e.target.innerHeight,
        });
      },
      false
    );
    // if (moveState?.outward?.images.length) setImages(moveState.outward.images)
    // setOriginalImageUrl(state.captured_images)
  }, []);

  useEffect(() => {
    if (cameraId) {
      getVideo();
    }
  }, [windowSize, cameraId]);

  useEffect(() => {
    let videoInputs = [];

    const initialiseListOfVideoInputs = async () => {

      //get permissions
      const video = await navigator.mediaDevices.getUserMedia({
        video:true
      })

      // Get the details of audio and video output of the device
      const enumerateDevices = await navigator.mediaDevices.enumerateDevices();

      //Filter video outputs (for devices with multiple cameras)
      videoInputs = enumerateDevices.filter(
        (device) => device.kind === "videoinput"
      );
      if (videoInputs && videoInputs.length) {
        let videoInputsCpy = [...videoInputs];
        let deviceCameraId = videoInputsCpy.pop().deviceId;
      

        let videoInputList = [];

        videoInputs.forEach((input) => {
          // alert(JSON.stringify(input));
          let obj = {
            deviceId: input.deviceId,
            label: input.label,
          };
          videoInputList.push(obj);
        });
        setListOfVideoInputs(videoInputList);
        setCameraId(deviceCameraId);
      } else {
        handleError("error", "no camera found");
      }
    };

    initialiseListOfVideoInputs();

    return () => {
      closeCameraInstance();
    };
  }, []);

  const getVideo = () => {
    // alert(cameraId)
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: window.innerWidth,
          height: matches ? window.innerHeight : window.innerHeight * 0.6,
          // facingMode: {
          //     exact: "environment",
          // },
          deviceId: {
            exact: cameraId,
          },
        },
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
        // alert(playPromise)
        // console.log(playPromise,'playPromise');
        // if (playPromise !== undefined) {
        //   playPromise
        //     .then((_) => {
        //       // Automatic playback started!
        //       // Show playing UI.
        //       // We can now safely pause video...
        //       handleError("success", "play success");
        //     })
        //     .catch((error) => {
        //       // Auto-play was prevented
        //       // Show paused UI.
        //       // video.pause()
        //       handleError("error", "play error");
        //     })
        //     .finally(()=>{
        //       handleError("success", "setteled")
        //     })
        // }else{
        //   handleError("error", "no promise");
        // }
      })
      .catch((err) => {
        console.log(err, "err again");
      });
  };

  const capturePicture = () => {
    if (images.length === parseInt(process.env.IMAGE_CAPTURE_LIMIT)) return;

    let canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    let contex = canvas.getContext("2d");
    contex.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    let imageData = {
      attachment_base64_string: canvas.toDataURL(),
      entity_id,
      entity_type: "damage",

      file_type: "png",
      isUploading: true,
      uploadStatus: "progress",
    };

    setImages((images) => [...images, imageData]);
    uploadAsync([imageData]);
  };

  const uploadImageFromGallery = (e) => {
    const encodeImageFileAsBase64 = (file) => {
      const fileSize = file.size / 1024 / 1024;

      if (fileSize > 3) {
        handleError("warning", "File size should be less than 3mb");
        return;
      }

      let fileName = file.name.split(".")[0];
      let fileType = file.type.split("/")[1];

      let reader = new FileReader();
      reader.onloadend = () => {
        let imageData = {
          attachment_base64_string: reader.result,
          entity_id,
          entity_type: "damage",
          file_name: fileName,
          file_type: fileType,
          isUploading: true,
          uploadStatus: "progress",
        };

        setImages((images) => [...images, imageData]);
        uploadAsync([imageData]);
      };

      reader.readAsDataURL(file);
    };
    if (images.length === parseInt(process.env.IMAGE_CAPTURE_LIMIT)) {
      handleError("warning", "Only 5 images allowed");
      return;
    }

    let filesSizeRemain =
      parseInt(process.env.IMAGE_CAPTURE_LIMIT) - images.length;

    const filesToUpload = Object.keys(e.target.files)
      .slice(0, filesSizeRemain)
      .reduce((result, key) => {
        result[key] = e.target.files[key];

        return result;
      }, {});
    if (e.target.files.length > Object.keys(filesToUpload).length)
      handleError("warning", "Only 5 images allowed");

    Object.keys(filesToUpload).forEach(function (key) {
      encodeImageFileAsBase64(filesToUpload[key]);
    });

    // for (let file of filesToUpload) {
    //     encodeImageFileAsBase64(file)
    // }
    // horizontalScroller()
  };

  const deleteFile = (image) => {};

  // const switchCamera = async () => {
  //   // The device has more than one camera
  //   if (listOfVideoInputs.length > 1) {
  //     closeCameraInstance();

  //     // if (cameraNumber === 0)
  //     //     setCameraNumber(1) // switch to second camera
  //     // else if (cameraNumber === 1) setCameraNumber(0) // switch to first camera

  //     if (cameraNumber + 1 === listOfVideoInputs.length) setCameraNumber(0);
  //     else setCameraNumber(cameraNumber + 1);
  //   } else if (listOfVideoInputs.length === 1) {
  //     handleError("warning", "The device has only one camera");
  //   } else {
  //     handleError("error", "The device does not have a camera");
  //   }
  // };

  // const closeCaptureImage = (e) => {
  //   closeCameraInstance();

  //   // handlesetDrawer(state.inventory_tracking_id, e, true)
  // };

  const uploadAsync = (uploadData) => {
    // setUploadImageLoading(true)
    setDisableAction(true);
    // const attachments = uploadData.map((data) => {
    //   const { isUploading, uploadStatus, ...restData } = data;
    //   return restData;
    // });
  };

  const setImagesData = (status, reference_id, attachment_id = undefined) => {
    setImages((images) => {
      return images.map((image) => {
        if (image.reference_id === reference_id) {
          if (attachment_id) {
            return {
              ...image,
              isUploading: status === "progress" ? true : false,
              uploadStatus: status,
              attachmentID: attachment_id,
            };
          }
          return {
            ...image,
            isUploading: status === "progress" ? true : false,
            uploadStatus: status,
          };
        }
        return image;
      });
    });

    if (status === "failed") {
      handleError("error", "Failed to upload some images");
    }
  };

  const doneCaptuerImages = async (e) => {
    closeCameraInstance();
    closeCapturedImages();
  };

  const changeCamera = (deviceId) => {
    closeCameraInstance();
    setCameraId(deviceId);
  };
  return (
    <Drawer anchor="bottom" open={true}>
      <div
        style={{
          display: "flex",
          flexDirection: matches ? "row" : "column",
          gap: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            width: !matches && "100vw",
            height: !matches && "60vh",
            position: "relative",
          }}
        >
          <video
            ref={videoRef}
            style={{
              height: "100%",
              width: "100%",
              objectFit: matches && "cover",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              margin: "0 auto",
            }}
          >
            <IconButton
              sx={{ color: "red" }}
              onClick={capturePicture}
              disabled={listOfVideoInputs.length < 1}
            >
              <CameraIcon fontSize="large" />
            </IconButton>
            {listOfVideoInputs.length > 1 && (
              <Select
                name="changeCamera"
                size="medium"
                onChange={(e) => changeCamera(e.target.value)}
                value={cameraId}
              >
                {listOfVideoInputs.map((videoInput) => {
                  return <MenuItem value={videoInput.deviceId}>{videoInput.label}</MenuItem>;
                })}
              </Select>
            )}
            <IconButton
              sx={{ color: "red" }}
              onClick={() => fileInputRef.current.click()}
            >
              <CloudUploadIcon fontSize="large" />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept="image/*"
              onChange={uploadImageFromGallery}
              multiple
            />
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: !matches && "calc(40vh - 48px)",
            width: !matches && "100vw",
            backgroundColor: "#161a1d",
            padding: ".5rem",
            gap: "1rem",
            alignItems: "center",
            ...(!images.length && {
              justifyContent: "space-evenly",
            }),
          }}
        >
          {images.length ? (
            <ImageViewer
              images={images}
              matches={matches}
              deleteFile={deleteFile}
              isDeleteFile={true}
              uploadAsync={uploadAsync}
              setImagesData={setImagesData}
            />
          ) : (
            <Typography
              variant={largeDevices ? "h6" : "subtitle1"}
              sx={{ textAlign: "center", color: "#fff" }}
            >
              Please attach images for the repaired product
            </Typography>
          )}
          <Stack direction={matches ? "column" : "row"} spacing={1}>
            {images.length ? (
              <Button
                variant="contained"
                sx={{ fontSize: "1rem", padding: "6px 10px" }}
                onClick={doneCaptuerImages}
                disabled={disableAction}
              >
                {uploadImageLoading && (
                  <CircularProgress
                    size={20}
                    sx={{
                      color: "#fff",
                      marginRight: "5px",
                    }}
                  />
                )}
                Done
              </Button>
            ) : (
              <Button
                onClick={doneCaptuerImages}
                variant="contained"
                sx={{ fontSize: "1rem", padding: "6px 10px" }}
                disabled={disableAction}
              >
                Cancle
              </Button>
            )}
          </Stack>
        </div>
      </div>
      {error.status ? (
        <Snackbar
          open={true}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => setError(false)}
        >
          <Alert severity={error.severity || "error"} sx={{ width: "100%" }}>
            {error.message || "Something went wrong, please try again later!"}
          </Alert>
        </Snackbar>
      ) : null}
    </Drawer>
  );
};

export default App;
