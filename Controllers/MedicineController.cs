using Microsoft.AspNetCore.Mvc;
using ABCPharmacy.Models;
using ABCPharmacy.Data;

namespace ABCPharmacy.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicineController : ControllerBase
{
    private readonly JsonMedicineRepository _repository;

    public MedicineController(JsonMedicineRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public IActionResult GetMedicines([FromQuery] string? search = null)
    {
        var medicines = _repository.GetAll();
        if (!string.IsNullOrWhiteSpace(search))
        {
            medicines = medicines.Where(m => m.FullName.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
        }
        return Ok(medicines);
    }

    [HttpPost]
    public IActionResult AddMedicine([FromBody] Medicine medicine)
    {
        if (medicine == null || string.IsNullOrWhiteSpace(medicine.FullName))
            return BadRequest("Invalid medicine details.");

        _repository.Add(medicine);
        return Ok(medicine);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateMedicine(string id, [FromBody] Medicine medicine)
    {
        if (medicine == null || id != medicine.Id || string.IsNullOrWhiteSpace(medicine.FullName))
        {
            return BadRequest("Invalid medicine details.");
        }

        var success = _repository.Update(medicine);
        if (!success)
        {
            return NotFound("Medicine not found.");
        }

        return Ok(medicine);
    }
}
