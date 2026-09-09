import React, { useState } from "react";
import {
  FaChartBar,
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaUsers,
  FaUserGraduate,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaBook,
  FaSearch,
} from "react-icons/fa";

import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "./Reports.css";


const Reports = () => {


  const students =
    JSON.parse(localStorage.getItem("students")) || [];

  const faculty =
    JSON.parse(localStorage.getItem("faculty")) || [];

  const courses =
    JSON.parse(localStorage.getItem("courses")) || [];

  const fees =
    JSON.parse(localStorage.getItem("fees")) || [];


  const totalFees = fees.reduce(
    (sum, item) =>
      sum + Number(item.paidFee || 0),
    0
  );


  const [search,setSearch] = useState("");



  const reports = [

    {
      id:1,
      title:"Student Report",
      description:"Student details and academic information.",
      icon:<FaUserGraduate/>,
      count:students.length
    },


    {
      id:2,
      title:"Faculty Report",
      description:"Faculty details and workload summary.",
      icon:<FaUsers/>,
      count:faculty.length
    },


    {
      id:3,
      title:"Course Report",
      description:"Available courses and departments.",
      icon:<FaBook/>,
      count:courses.length
    },


    {
      id:4,
      title:"Fee Collection Report",
      description:"Complete fee payment summary.",
      icon:<FaMoneyBillWave/>,
      count:`₹${totalFees}`
    },


    {
      id:5,
      title:"Attendance Report",
      description:"Student attendance percentage.",
      icon:<FaClipboardCheck/>,
      count:"94%"
    }

  ];





// PDF Download

const downloadPDF=(title)=>{

 const pdf = new jsPDF();


 pdf.text(
   "College ERP Report",
   20,
   20
 );


 pdf.text(
   title,
   20,
   35
 );


 pdf.text(
 `Generated Date : ${new Date().toLocaleDateString()}`,
 20,
 50
 );


 pdf.save(
 `${title}.pdf`
 );


};





// Excel Download

const downloadExcel=(title)=>{


 let data=[];


 if(title==="Student Report")
 {
   data=students;
 }

 else if(title==="Faculty Report")
 {
   data=faculty;
 }

 else if(title==="Fee Collection Report")
 {
   data=fees;
 }

 else
 {
   data=reports;
 }



 const worksheet =
 XLSX.utils.json_to_sheet(data);


 const workbook =
 XLSX.utils.book_new();



 XLSX.utils.book_append_sheet(
 workbook,
 worksheet,
 "Report"
 );


 const excelBuffer =
 XLSX.write(
 workbook,
 {
  bookType:"xlsx",
  type:"array"
 }
 );


 const file =
 new Blob(
 [excelBuffer],
 {
 type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
 }
 );


 saveAs(
 file,
 `${title}.xlsx`
 );


};






// Complete Report

const downloadComplete=()=>{


const data=[

{
Type:"Students",
Total:students.length
},

{
Type:"Faculty",
Total:faculty.length
},

{
Type:"Courses",
Total:courses.length
},

{
Type:"Collected Fees",
Total:totalFees
}

];


const sheet =
XLSX.utils.json_to_sheet(data);


const book =
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
book,
sheet,
"ERP Report"
);



XLSX.writeFile(
book,
"College_ERP_Report.xlsx"
);


};




return (

<div className="reports-page">


<div className="reports-header">

<h1>
<FaChartBar/>
 Reports
</h1>

<p>
Generate College ERP Reports
</p>


</div>



<div className="search-report">

<FaSearch/>

<input

placeholder="Search Report..."

onChange={
e=>setSearch(e.target.value)
}

/>

</div>





<div className="report-grid">


{
reports
.filter(
item=>
item.title
.toLowerCase()
.includes(
search.toLowerCase()
)
)

.map(report=>(



<div className="report-card"
key={report.id}>


<div className="report-icon">

{report.icon}

</div>



<h2>
{report.title}
</h2>


<p>
{report.description}
</p>



<h3>
Total : {report.count}
</h3>



<div className="report-actions">


<button
className="pdf-btn"
onClick={()=>
downloadPDF(report.title)
}
>

<FaFilePdf/>
PDF

</button>



<button
className="excel-btn"
onClick={()=>
downloadExcel(report.title)
}
>

<FaFileExcel/>
Excel

</button>



</div>


</div>


))

}



</div>





<div className="summary-section">


<h2>
Quick Statistics
</h2>


<div className="summary-grid">


<div className="summary-card">
<h3>Students</h3>
<span>{students.length}</span>
</div>


<div className="summary-card">
<h3>Faculty</h3>
<span>{faculty.length}</span>
</div>



<div className="summary-card">
<h3>Courses</h3>
<span>{courses.length}</span>
</div>



<div className="summary-card">
<h3>Fees</h3>
<span>
₹{totalFees}
</span>
</div>


</div>


</div>




<div className="download-all">


<button
className="download-btn"
onClick={downloadComplete}
>

<FaDownload/>

Download Complete Report

</button>


</div>



</div>

);

};


export default Reports;
