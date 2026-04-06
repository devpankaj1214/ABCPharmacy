using System.Text.Json;
using ABCPharmacy.Models;

namespace ABCPharmacy.Data;

public class JsonMedicineRepository
{
    private readonly string _filePath = "medicines.json";
    private readonly object _lock = new();

    public JsonMedicineRepository()
    {
        if (!File.Exists(_filePath))
        {
            File.WriteAllText(_filePath, "[]");
        }
    }

    public List<Medicine> GetAll()
    {
        lock (_lock)
        {
            var json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<Medicine>>(json) ?? new List<Medicine>();
        }
    }

    public void Add(Medicine medicine)
    {
        lock (_lock)
        {
            var medicines = GetAll();
            medicine.Id = Guid.NewGuid().ToString();
            medicines.Add(medicine);
            SaveAll(medicines);
        }
    }

    public bool Update(Medicine modifiedMedicine)
    {
        lock (_lock)
        {
            var medicines = GetAll();
            var index = medicines.FindIndex(m => m.Id == modifiedMedicine.Id);
            
            if (index == -1)
            {
                return false;
            }

            medicines[index] = modifiedMedicine;
            SaveAll(medicines);
            return true;
        }
    }

    private void SaveAll(List<Medicine> medicines)
    {
        var json = JsonSerializer.Serialize(medicines, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_filePath, json);
    }
}
