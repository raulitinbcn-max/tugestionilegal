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

export async function GET(req: NextRequest) 
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

    const categorias = await db.categoriasTramite.findMany(
export const dynamic = 'force-dynamic'
{
      orderBy: 
export const dynamic = 'force-dynamic'
{ orden: 'asc' },
    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(categorias)
export const dynamic = 'force-dynamic'

  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error fetching categorias:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: 'Error al obtener categorÃ­as' },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'


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

    const 
export const dynamic = 'force-dynamic'
{ clave, codigo, nombre, descripcion, icono, color, orden } = await req.json()

export const dynamic = 'force-dynamic'

    if (!clave || !codigo || !nombre) 
export const dynamic = 'force-dynamic'
{
      return NextResponse.json(
export const dynamic = 'force-dynamic'

        
export const dynamic = 'force-dynamic'
{ error: 'clave, codigo y nombre son requeridos' },
        
export const dynamic = 'force-dynamic'
{ status: 400 }
      )
export const dynamic = 'force-dynamic'

    }
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    const categoria = await db.categoriasTramite.create(
export const dynamic = 'force-dynamic'
{
      data: 
export const dynamic = 'force-dynamic'
{
        clave,
export const dynamic = 'force-dynamic'

        codigo,
export const dynamic = 'force-dynamic'

        nombre,
export const dynamic = 'force-dynamic'

        descripcion: descripcion || null,
export const dynamic = 'force-dynamic'

        icono: icono || null,
export const dynamic = 'force-dynamic'

        color: color || null,
export const dynamic = 'force-dynamic'

        orden: orden || 0,
export const dynamic = 'force-dynamic'

      },
export const dynamic = 'force-dynamic'

    })
export const dynamic = 'force-dynamic'


export const dynamic = 'force-dynamic'

    return NextResponse.json(categoria, 
export const dynamic = 'force-dynamic'
{ status: 201 })
  } catch (error) 
export const dynamic = 'force-dynamic'
{
    console.error('Error creating categoria:', error)
export const dynamic = 'force-dynamic'

    return NextResponse.json(
export const dynamic = 'force-dynamic'

      
export const dynamic = 'force-dynamic'
{ error: error instanceof Error ? error.message : 'Error al crear categorÃ­a' },
      
export const dynamic = 'force-dynamic'
{ status: 500 }
    )
export const dynamic = 'force-dynamic'

  }
export const dynamic = 'force-dynamic'

}
export const dynamic = 'force-dynamic'

