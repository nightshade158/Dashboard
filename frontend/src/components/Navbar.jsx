import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Navbar = ({ name }) => {
    return (
        <div className="bg-transparent flex border-transparent items-center justify-between px-6 py-2">
            <h2 className="text-xl font-medium text-black py-2">
                <img src={assets.logo} alt='' className='w-24' />
            </h2>
            <h1 className="text-5xl font-bold text-center mb-6">{name}</h1>
            <div className="top-4 right-0 flex flex-col gap-4">
                <Link className='relative overflow-hidden rounded-lg px-20 py-6' to="/">
                    <span className='absolute inset-px flex items-center justify-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-50'>Logout</span>
                    <span aria-hidden className='absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-ping before:bg-gradient-to-r before:from-purple-700 before:via-red-500 before:to-amber-400'/>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;