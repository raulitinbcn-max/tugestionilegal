import 
export const dynamic = 'force-dynamic'
{ db } from '@/lib/db'
import 
export const dynamic = 'force-dynamic'
{ NextRequest, NextResponse } from 'next/server'
import 
export const dynamic = 'force-dynamic'
{ getServerSession } from 'next-auth/next'
import 
export const dynamic = 'force-dynamic'
{ authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) 
export const dynamic = 'force-dynamic'
{
  try 
export const dynamic = 'force-dynamic'
{
    const session = await getServerSession(authOptions)
export const dynamic = 'force-dynamic'

    if (!session) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'
{ error: 'Unauthorized' }, { status: 401 })
    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const CATEGORIAS = [
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'EXTRANJERIA',
export const dynamic = 'force-dynamic'

        codigo: 'EX-',
export const dynamic = 'force-dynamic'

        nombre: 'ExtranjerÃ­a General',
export const dynamic = 'force-dynamic'

        icono: 'ðŸŒ',
export const dynamic = 'force-dynamic'

        color: '#3b82f6',
export const dynamic = 'force-dynamic'

        orden: 1,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'EXTRANJERIA_MOVILIDAD',
export const dynamic = 'force-dynamic'

        codigo: 'MI-',
export const dynamic = 'force-dynamic'

        nombre: 'ExtranjerÃ­a (Movilidad)',
export const dynamic = 'force-dynamic'

        icono: 'âœˆï¸',
export const dynamic = 'force-dynamic'

        color: '#06b6d4',
export const dynamic = 'force-dynamic'

        orden: 2,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'NACIONALIDAD',
export const dynamic = 'force-dynamic'

        codigo: 'NE-',
export const dynamic = 'force-dynamic'

        nombre: 'Nacionalidad',
export const dynamic = 'force-dynamic'

        icono: 'ðŸ‡ªðŸ‡¸',
export const dynamic = 'force-dynamic'

        color: '#ec4899',
export const dynamic = 'force-dynamic'

        orden: 3,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'TRANSPORTE_DGT',
export const dynamic = 'force-dynamic'

        codigo: 'DGT-',
export const dynamic = 'force-dynamic'

        nombre: 'Conductores y VehÃ­culos',
export const dynamic = 'force-dynamic'

        icono: 'ðŸš—',
export const dynamic = 'force-dynamic'

        color: '#f59e0b',
export const dynamic = 'force-dynamic'

        orden: 4,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'LABORAL',
export const dynamic = 'force-dynamic'

        codigo: 'LAB-',
export const dynamic = 'force-dynamic'

        nombre: 'TrÃ¡mites Laborales',
export const dynamic = 'force-dynamic'

        icono: 'ðŸ’¼',
export const dynamic = 'force-dynamic'

        color: '#8b5cf6',
export const dynamic = 'force-dynamic'

        orden: 5,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'FISCAL',
export const dynamic = 'force-dynamic'

        codigo: 'FIS-',
export const dynamic = 'force-dynamic'

        nombre: 'TrÃ¡mites Fiscales',
export const dynamic = 'force-dynamic'

        icono: 'ðŸ’°',
export const dynamic = 'force-dynamic'

        color: '#10b981',
export const dynamic = 'force-dynamic'

        orden: 6,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{
        clave: 'OTROS',
export const dynamic = 'force-dynamic'

        codigo: 'TR-',
export const dynamic = 'force-dynamic'

        nombre: 'Otros TrÃ¡mites',
export const dynamic = 'force-dynamic'

        icono: 'ðŸ“Œ',
export const dynamic = 'force-dynamic'

        color: '#6b7280',
export const dynamic = 'force-dynamic'

        orden: 7,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

    ]
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    let created = 0
export const dynamic = 'force-dynamic'

    let existing = 0
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    for (const cat of CATEGORIAS) 
export const dynamic = 'force-dynamic'
{
      const exists = await db.categoriasTramite.findUnique(
export const dynamic = 'force-dynamic'
{
        where: 
export const dynamic = 'force-dynamic'
{ codigo: cat.codigo },
      })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

      if (!exists) 
export const dynamic = 'force-dynamic'
{
        await db.categoriasTramite.create(
export const dynamic = 'force-dynamic'
{ data: cat })
        created++
export const dynamic = 'force-dynamic'

      } else 
export const dynamic = 'force-dynamic'
{
        existing++
export const dynamic = 'force-dynamic'

      }
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'
{
      message: 'InicializaciÃ³n completada',
export const dynamic = 'force-dynamic'

      created,
export const dynamic = 'force-dynamic'

      existing,
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error initializing categorias:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: error instanceof Error ? error.message : 'Error al inicializar' },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'

