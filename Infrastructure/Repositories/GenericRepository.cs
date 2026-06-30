using System.Linq.Expressions;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Entities.Models;
using Infrastructure.Context;

namespace Infrastructure.Repositories;

public class GenericRepository<T> : IRepository<T> where T : BaseModel
{
    protected readonly AppDbContext _context;
    private readonly DbSet<T> _dbSet;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id, params string[] includes)
    {
        IQueryable<T> query = _dbSet.Where(x => !x.IsDeleted);

        // eğer include edilecek tablolar gönderilmişse bunları sorguya ekle
        if (includes != null)
        {
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
        }

        return await query.FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null, params string[] includes)
    {
        IQueryable<T> query = _dbSet.Where(x => !x.IsDeleted);
        
        if (predicate != null)
            query = query.Where(predicate);

        if (includes != null)
        {
            foreach (var include in includes)
            {
                query = query.Include(include); 
            }
        }

        return await query.ToListAsync();
    }

    public async Task AddAsync(T entity)
    {
        entity.CreatedDate = DateTime.UtcNow;
        await _dbSet.AddAsync(entity);
    }

    public Task UpdateAsync(T entity)
    {
        entity.UpdatedDate = DateTime.UtcNow;
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity)
    {
        entity.IsDeleted = true;
        entity.UpdatedDate = DateTime.UtcNow;
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}