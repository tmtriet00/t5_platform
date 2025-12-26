import { UploadFile } from "antd/lib/upload/interface";
import { EventArgs } from "interfaces";

export const normalizeFile = (event: EventArgs) => {
  const { fileList } = event;

  return fileList.map((item) => {
    const { uid, name, type, size, response, percent, status } = item;

    return {
      uid,
      name,
      url: item.url || response?.url,
      type,
      size,
      percent,
      status,
    };
  });
};