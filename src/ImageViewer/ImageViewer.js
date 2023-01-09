// eslint-disable-next-line
import React from "react"
import styles from "../CaptureDamage/CaptureDamage.module.css"
import IconButton from "@mui/material/IconButton"
import { CircularProgress, Typography } from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import Stack from "@mui/material/Stack"
import ReplayIcon from "@mui/icons-material/Replay"

//TODO - reduce image size on desktop
export const ImageViewer = ({
    images,
    matches,
    deleteFile,
    isDeleteFile,
    uploadAsync,
    setImagesData
}) => {
    console.log(images, "image viewer")

    // const retryUpload = (image) => {
    //     setImagesData("progress", image.reference_id, 0)
    //     uploadAsync([image])
    // }

    return (
        <div className={styles.ImageContainer}>
            {images.map((image, index) => (
                <div
                    key={index}
                    style={{
                        maxHeight: matches ? "40vh" : "20vh",
                        maxWidth: matches ? "30vw" : "50vw",
                        // padding: "0.5rem",
                        textAlign: "center",
                        position: "relative",
                        flex: "0 0 auto",
                    }}
                    className={
                        image?.isUploading || image?.uploadStatus
                            ? styles.blur
                            : undefined
                    }
                >
                    {isDeleteFile && (
                        <IconButton
                            sx={{
                                position: "absolute",
                                right: "2px",
                                top: "2px",
                                padding: 0,
                                margin: 0,
                                zIndex:"1"
                            }}
                            onClick={() => deleteFile(image)}
                            disabled={image?.uploadStatus === "progress"}
                        >
                            <div
                                className={styles.RemoveIcon}
                                style={{ display: "inline" }}
                            >
                                &#215;
                            </div>
                        </IconButton>
                    )}

                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: "1",
                        }}
                    >
                        {image?.uploadStatus === "progress" && (
                            <CircularProgress
                                size={30}
                                thickness={5}
                                sx={{ color: "#fff" }}
                            />
                        )}
                        {image?.uploadStatus === "success" && (
                            <CheckIcon
                                fontSize="large"
                                sx={{ color: "#23C174" }}
                            />
                        )}
                        {image?.uploadStatus === "failed" && (
                            <Stack justifyContent="center" alignItems="center">
                                <ReplayIcon
                                    
                                    fontSize="large"
                                    sx={{ color: "#E5383B" }}
                                />
                                <Typography
                                    variant="body"
                                    sx={{ color: "#fff" }}
                                >
                                    Failed
                                </Typography>
                            </Stack>
                        )}
                    </div>

                    <img
                        src={image.attachment_base64_string}
                        alt={image.file_name}
                        className={styles.CaptureImage}
                    />
                </div>
            ))}
        </div>
    )
}
