interface Data {
  data: Uint8Array;
  filename: string;
}

export function saveToFile(fileData: Data[]) {
  const a = document.createElement("a");

  fileData.forEach((f) => {
    const blob = new Blob([f.data], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = f.filename;
    a.click();
    URL.revokeObjectURL(url);
  });

  a.remove();
}
