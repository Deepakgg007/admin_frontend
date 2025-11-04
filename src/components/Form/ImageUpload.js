import {useEffect} from 'react'

function ImageUpload({src, ...props}) {
    // thumbnail uplaod
    function uploadImage (selector) {
        let elem = document.querySelectorAll(selector);
        elem.forEach(item => {
            item.addEventListener("change", function(){
                if(item.files && item.files[0]) {
                    let img = document.getElementById(item.dataset.target);
                    img.onload = function() {
                        URL.revokeObjectURL(img.src);
                    }
                    img.src = URL.createObjectURL(item.files[0]);

                    let allowedExtensions  = ["jpg", "JPEG", "JPG", "png" ];
                    let fileExtension  = this.value.split(".").pop();
                    var lastDot = this.value.lastIndexOf('.');
                    var ext = this.value.substring(lastDot + 1);
                    var extTxt = img.value = ext;
                    if (!allowedExtensions.includes(fileExtension)) {
                        alert(extTxt + " file type not allowed, Please upload jpg, JPG, JPEG, or png file");
                        img.src = "/images/avatar/avatar-placeholder.jpg";
                    }
                }

            })
        });
    }

    useEffect(() => {
        uploadImage(".upload-image");
    });
    
  return (
    <div className="image-upload-wrap d-flex flex-column align-items-center">
        <div className="media media-huge border">
            <img id="image-result" className="w-100 h-100" src={src} alt="avatar"/>
        </div>
        <div className="pt-3">
            <input className="upload-image" data-target="image-result" id="change-avatar" type="file" max="1" hidden/>
            <label htmlFor="change-avatar" className="btn btn-md btn-primary">Change</label>
        </div>
    </div>
  )
}

export default ImageUpload;
