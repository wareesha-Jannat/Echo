import { useRef } from "react";
import{Cropper, ReactCropperElement, } from "react-cropper"
import {  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface CropImageDialogProps{
    src: string;
    cropAspectRatio: number;
    onCropped: (blob:Blob | null) => void;
    onclose:() => void;
}

export default function CropImageDialog({src, cropAspectRatio, onclose, onCropped}: CropImageDialogProps){
    const cropperRef = useRef<ReactCropperElement>(null);

    function crop(){
        const cropper = cropperRef.current?.cropper;
        if(!cropper) return
        cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp")
        onclose();
    }

    return(
        
        <Dialog open onOpenChange={onclose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>
                <Cropper
                src={src}
                aspectRatio={cropAspectRatio}
                guides={false}
                zoomable={false}
                ref= {cropperRef}
                className="mx-auto size-fit"
                />
                <DialogFooter>
                     
                    <Button variant="secondary" onClick={onclose} >Cancel </Button>
                    <Button onClick={crop} >Crop </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}