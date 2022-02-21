import * as React from "react";
import { Toaster } from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdCheckmark } from "react-icons/io";

export const Notifications = () => {
    let alertDuration = 6_000; // remove notification after this second
    // alertDuration = 1_000_000;

    return (
        <Toaster
            toastOptions={{
                duration: alertDuration,
                position: "top-right",

                success: {
                    icon: (
                        <div className="alert__icon-cont alert__icon-cont-success">
                            <IoMdCheckmark />
                        </div>
                    ),
                    className: "alert__success alert__cont",
                },

                error: {
                    icon: (
                        <div className="alert__icon-cont alert__icon-cont-error">
                            <AiOutlineClose />
                        </div>
                    ),
                    className: "alert__error alert__cont",
                },
            }}
        />
    );
};
