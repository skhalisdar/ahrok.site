import PDFDocument from 'pdfkit';
import {readFile} from 'node:fs/promises';

const labels={day:'Date',id:'Student ID',name:'Student',grade:'Grade',attendance:'Attendance',homework:'Homework',note:'Note',teacher:'Teacher',signed_in:'Signed in',at:'Recorded at',activity:'Activity',student:'Student',status:'Status',category:'Category',detail:'Details',action_taken:'Action taken',recorded_by:'Recorded by',resolved_by:'Resolved by',resolution:'Resolution',resolved_at:'Resolved at',contact_name:'Pickup contact',voided_by:'Voided by',void_reason:'Correction reason',voided_at:'Voided at'};

export async function reportPDF({type,from,to,columns,rows,fontPath=new URL('./fonts/DejaVuSans.ttf',import.meta.url),logoPaths=[new URL('./report-assets/nycmc-wellspring.png',import.meta.url),new URL('./report-assets/compass.png',import.meta.url)]}) {
  const doc=new PDFDocument({size:'LETTER',margin:42,autoFirstPage:false,compress:true,info:{Title:`NYCMC Wellspring | COMPASS NYC | After School | ${type} report`,Author:'NYCMC Wellspring / COMPASS NYC'}});
  const chunks=[]; const ready=new Promise((resolve,reject)=>{doc.on('data',c=>chunks.push(c));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
  doc.registerFont('Report',await readFile(fontPath));
  const logos=await Promise.all(logoPaths.map(path=>readFile(path)));
  const widths={attendance:[75,55,200,50,148],homework:[75,50,140,90,173],staff:[85,160,70,213],activities:[85,150,160,133]}[type];
  let y=0,page=0;
  function newPage(){
    doc.addPage();page++;
    doc.image(logos[0],42,25,{fit:[125,80],align:'center',valign:'center'});
    doc.image(logos[1],400,30,{fit:[170,75],align:'center',valign:'center'});
    doc.font('Report').fontSize(18).fillColor('#17213a').text('After School',170,48,{width:225,align:'center',lineBreak:false});
    doc.fontSize(11).text('NYCMC Wellspring | COMPASS NYC',42,117,{width:528,align:'center',lineBreak:false});
    doc.fontSize(14).fillColor('#075985').text(type.charAt(0).toUpperCase()+type.slice(1)+' report',42,143,{lineBreak:false});
    doc.fontSize(9).fillColor('#536078').text(`${from} through ${to}  |  ${rows.length} record${rows.length===1?'':'s'}`,42,166,{lineBreak:false});
    doc.moveTo(42,185).lineTo(570,185).strokeColor('#cbd5e1').stroke();
    doc.fontSize(8).text('Private program records',42,755,{lineBreak:false});
    doc.text(`Page ${page}`,515,755,{lineBreak:false});y=199;
    if(widths){let x=42;doc.fontSize(8).fillColor('#075985');columns.forEach((column,i)=>{doc.text(labels[column]??column,x+3,y,{width:widths[i]-6,lineBreak:false});x+=widths[i];});y+=22;}
  }
  function line(text,{size=10,color='#17213a'}={}){
    if(y>720)newPage();
    doc.font('Report').fontSize(size).fillColor(color).text(text,42,y,{lineBreak:false});y+=15;
  }
  function wrapped(text){
    doc.font('Report').fontSize(10);
    for(const paragraph of String(text).replace(/\r\n?/g,'\n').split('\n')){
      let current='';
      for(const char of paragraph){
        if(doc.widthOfString(current+char)>528){line(current);current=char;}else current+=char;
      }
      line(current);
    }
  }
  newPage();
  if(!rows.length)line('No records for the selected date range.');
  rows.forEach((row,index)=>{
    if(widths){
      doc.font('Report').fontSize(9);
      const cells=columns.map((column,i)=>{
        let value=row[column];if(column==='signed_in')value=value?'Yes':'No';
        const text=String(value??'-').replace(/\s+/g,' '),lines=[];let current='';
        for(const char of text){if(doc.widthOfString(current+char)>widths[i]-8){lines.push(current);current=char;}else current+=char;}
        lines.push(current);return lines;
      });
      const height=Math.max(...cells.map(c=>c.length))*13+12;
      if(y+height>730)newPage();
      doc.font('Report').fontSize(9).fillColor('#17213a');let x=42;
      cells.forEach((lines,i)=>{lines.forEach((text,j)=>doc.text(text,x+3,y+5+j*13,{lineBreak:false}));x+=widths[i];});
      y+=height;doc.moveTo(42,y).lineTo(570,y).strokeColor('#e2e8f0').stroke();return;
    }
    if(y>675)newPage();
    line(`Record ${index+1}`,{size:11,color:'#075985'});
    for(const column of columns){
      let value=row[column];
      if(column==='signed_in')value=value?'Yes':'No';
      wrapped(`${labels[column]??column}: ${value===null||value===undefined||value===''?'-':value}`);
    }
    y+=8;
    if(y<730){doc.moveTo(42,y).lineTo(570,y).strokeColor('#e2e8f0').stroke();y+=16;}
  });
  doc.end();return ready;
}
