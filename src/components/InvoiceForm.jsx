import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function InvoiceForm() {
  const [formData, setFormData] = useState({
    pelanggan: "",
    alamat: "",
    tanggal: "",
    items: [{ nama: "", jumlah: "", harga: "" }],
    keterangan: "",
  });

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { nama: "", jumlah: "", harga: "" }],
    });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:3001/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Gagal generate invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${formData.pelanggan}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal generate invoice");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Generator</h1>
      <Card>
        <CardContent className="space-y-4">
          <Input placeholder="Nama Pelanggan" value={formData.pelanggan} onChange={(e) => handleChange("pelanggan", e.target.value)} />
          <Textarea placeholder="Alamat" value={formData.alamat} onChange={(e) => handleChange("alamat", e.target.value)} />
          <Input type="date" value={formData.tanggal} onChange={(e) => handleChange("tanggal", e.target.value)} />

          <div className="space-y-2">
            <h2 className="font-semibold">Item</h2>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <Input placeholder="Nama Barang" value={item.nama} onChange={(e) => handleItemChange(index, "nama", e.target.value)} />
                <Input placeholder="Jumlah" type="number" value={item.jumlah} onChange={(e) => handleItemChange(index, "jumlah", e.target.value)} />
                <Input placeholder="Harga Satuan" type="number" value={item.harga} onChange={(e) => handleItemChange(index, "harga", e.target.value)} />
              </div>
            ))}
            <Button onClick={addItem}>Tambah Item</Button>
          </div>

          <Textarea placeholder="Keterangan" value={formData.keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />

          <Button className="w-full" onClick={handleSubmit}>
            Generate Invoice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
