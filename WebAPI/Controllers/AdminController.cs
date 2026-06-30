using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAuthService _authService;

    public AdminController(IAuthService authService)
    {
        _authService = authService;
    }
    [HttpGet("pending-sellers")]
    public async Task<IActionResult> GetPendingSellers()
    {
        var result = await _authService.GetPendingSellersAsync();
        return Ok(result); // 200 HTTP statü kodu ile listeyi dönüyoruz.
    }

    [HttpPut("approve-seller")] 
    public async Task<IActionResult> ApproveSeller([FromBody] UpdateSellerStatusDto dto)
    {
        var result = await _authService.UpdateSellerStatusAsync(dto.UserId, dto.IsApproved);
        
        if (!result)
        {
            return BadRequest(new { message = "Kullanıcı bulunamadı veya satıcı rolünde değil." });
        }

        return Ok(new { message = dto.IsApproved ? "Satıcı başarıyla onaylandı." : "Satıcı başvurusu reddedildi." });
    }
}