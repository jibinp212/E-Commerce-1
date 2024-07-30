
const NewsLetter = () => {
  return (
   <section className="max_padd_container py-12 xl:py-28 bg-white"> 
    <div className="mx-auto xl:w-[80%] flexCenter flex-col gap-y-8 w-full max-w-[666px]"> 
      <h3 className="h3"> Get Exclusive in your Email </h3>
      <h4 className="uppercase bold-18"> Subscribe to Your NewsLetter and Stay updated  </h4>
      <div className="flexBetween rounded-full ring-1 hover:ring-slate-900/9 hover:ring-slate-900/15 bg-primary w-full max-w-[588px]"> 
        <input type="email" placeholder="Enter Your Email Address" className="w-full bg-transparent ml-7 border-none outline-none regular-16"/>
        <button className="btn_dark_rounded"> Subscribe </button>
      </div>
    </div>
   </section>
  )
}

export default NewsLetter
