import React, { useEffect } from "react";
import { AddEstimationForTaskModal, AddEstimationForTaskModalRef } from "./add-estimation-for-task"

export class ModalProviderService {
    static ADD_ESTIMATION_FOR_TASK = "add-estimation-for-task";

    static modalProviderByName: Record<string, React.RefObject<any>> = {};

    static registerModal(name: string, ref: React.RefObject<any>) {
        this.modalProviderByName[name] = ref;
    }

    static getAddEstimationForTaskModal() {
        return this.modalProviderByName[this.ADD_ESTIMATION_FOR_TASK] as React.RefObject<AddEstimationForTaskModalRef>;
    }
}

export const ModalProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const addEstimationForTaskModalRef = React.useRef<AddEstimationForTaskModalRef>(null);

    useEffect(() => {
        ModalProviderService.registerModal(ModalProviderService.ADD_ESTIMATION_FOR_TASK, addEstimationForTaskModalRef);
    }, [addEstimationForTaskModalRef]);

    return <>
        {children}
        <AddEstimationForTaskModal ref={addEstimationForTaskModalRef} />
    </>
}