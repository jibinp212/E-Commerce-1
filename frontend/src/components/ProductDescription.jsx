const ProductDescription = () => {
  return (
    <div className='mt-20'>
        <div className='flex gap-3 mb-4 '> 
            <button className='btn_dark_rounded !rounded-none !text-xs !py-[6px] w-36 '> Decription </button>
            <button className='btn_dark_outline !rounded-none !text-xs !py-[6px] w-36 '> Care Guides </button>
            <button className='btn_dark_outline !rounded-none !text-xs !py-[6px] w-36 '> Size Guide </button>
        </div >
        <div className='flex flex-col pb-16'> 
            <p className='text-sm'> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestias illum dicta error tempore, quod culpa impedit iste amet quis at, eaque dignissimos sequi, quam nihil perspiciatis molestiae. Tenetur, architecto vel?</p>
            <p className='text-sm'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ratione ea nisi accusantium fugiat, officia, odio quos totam, vero atque accusamus repudiandae harum magni amet quae perferendis. Dolores praesentium libero nisi.</p>
        </div>
    </div>
  )
}

export default ProductDescription
